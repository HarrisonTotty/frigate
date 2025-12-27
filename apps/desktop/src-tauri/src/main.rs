//! Frigate Desktop Application
//!
//! Tauri-based desktop shell for the Frigate game client.
//! Provides CLI arguments for logging configuration, auto-setup options,
//! and a bridge for forwarding JavaScript console logs to the Rust logger.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod schematic;

use clap::Parser;
use log::{debug, error, info, trace, warn, LevelFilter};
use schematic::SchematicFile;
use std::fs::File;
use std::path::PathBuf;
use tauri_plugin_dialog::DialogExt;

/// Frigate Desktop - Spaceship Bridge Simulation Game Client
#[derive(Parser, Debug)]
#[command(name = "frigate")]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Log level (error, warn, info, debug, trace)
    #[arg(short, long, default_value = "info")]
    log_level: String,

    /// Path to log file (if not specified, logs to stderr)
    #[arg(short = 'f', long)]
    log_file: Option<PathBuf>,

    /// Server to connect to (HOST:PORT, port defaults to 8000)
    #[arg(long)]
    connect: Option<String>,

    /// Player name to select or create
    #[arg(long)]
    user: Option<String>,

    /// Team name to select or create
    #[arg(long)]
    team: Option<String>,

    /// Faction ID for new team (required when creating a new team)
    #[arg(long)]
    faction: Option<String>,

    /// Ship/blueprint name to select or create
    #[arg(long)]
    ship: Option<String>,

    /// Ship class for new ship (required when creating a new ship)
    #[arg(long, value_name = "CLASS")]
    ship_class: Option<String>,
}

/// CLI arguments exposed to the frontend via Tauri command
#[derive(Debug, Clone, serde::Serialize)]
struct CliArgs {
    /// Normalized server URL (http://host:port)
    connect: Option<String>,
    /// Player name to select or create
    user: Option<String>,
    /// Team name to select or create
    team: Option<String>,
    /// Faction ID for new team
    faction: Option<String>,
    /// Ship/blueprint name to select or create
    ship: Option<String>,
    /// Ship class for new ship
    ship_class: Option<String>,
}

/// Log levels that can be received from JavaScript
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum JsLogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

/// Parse log level string into LevelFilter
fn parse_log_level(level: &str) -> LevelFilter {
    match level.to_lowercase().as_str() {
        "error" => LevelFilter::Error,
        "warn" => LevelFilter::Warn,
        "info" => LevelFilter::Info,
        "debug" => LevelFilter::Debug,
        "trace" => LevelFilter::Trace,
        _ => {
            eprintln!("Invalid log level '{}', defaulting to 'info'", level);
            LevelFilter::Info
        }
    }
}

/// Normalize a server URL from CLI input
///
/// Handles various input formats:
/// - `localhost` → `http://localhost:8000`
/// - `localhost:9000` → `http://localhost:9000`
/// - `http://localhost` → `http://localhost:8000`
/// - `https://server.com` → `https://server.com:8000`
/// - `https://server.com:443` → `https://server.com:443`
fn normalize_server_url(input: &str) -> String {
    let mut url = input.to_string();

    // Add protocol if missing
    if !url.starts_with("http://") && !url.starts_with("https://") {
        url = format!("http://{}", url);
    }

    // Check if port is specified by looking for :PORT after the host
    // Parse to find if we need to add default port
    if let Some(proto_end) = url.find("://") {
        let after_proto = &url[proto_end + 3..];
        // Check if there's a port (look for : followed by digits, not in a path)
        let has_port = if let Some(slash_pos) = after_proto.find('/') {
            // Check before the path
            after_proto[..slash_pos].contains(':')
        } else {
            // No path, check the whole thing
            after_proto.contains(':')
        };

        if !has_port {
            // Insert default port before any path
            if let Some(slash_pos) = after_proto.find('/') {
                let (host, path) = after_proto.split_at(slash_pos);
                url = format!("{}://{}:8000{}", &url[..proto_end], host, path);
            } else {
                url = format!("{}:8000", url);
            }
        }
    }

    // Remove trailing slash for consistency
    if url.ends_with('/') {
        url.pop();
    }

    url
}

/// Initialize logging with the given configuration
fn init_logging(level: LevelFilter, log_file: Option<PathBuf>) {
    let mut builder = env_logger::Builder::new();
    builder.filter_level(level);

    // Configure log format
    builder.format_timestamp_millis();

    if let Some(path) = log_file {
        // Write logs to file
        match File::create(&path) {
            Ok(file) => {
                builder.target(env_logger::Target::Pipe(Box::new(file)));
                eprintln!("Logging to file: {}", path.display());
            }
            Err(e) => {
                eprintln!("Failed to create log file '{}': {}", path.display(), e);
                eprintln!("Falling back to stderr logging");
            }
        }
    }

    builder.init();
}

/// Tauri command to receive log messages from JavaScript
///
/// This allows the frontend to forward console.log/warn/error/etc
/// to the Rust logger, which can then write to file or stderr.
#[tauri::command]
fn js_log(level: JsLogLevel, message: String) {
    match level {
        JsLogLevel::Trace => trace!(target: "frigate::js", "{}", message),
        JsLogLevel::Debug => debug!(target: "frigate::js", "{}", message),
        JsLogLevel::Info => info!(target: "frigate::js", "{}", message),
        JsLogLevel::Warn => warn!(target: "frigate::js", "{}", message),
        JsLogLevel::Error => error!(target: "frigate::js", "{}", message),
    }
}

/// Tauri command to retrieve CLI arguments from the frontend
///
/// Returns the CLI arguments passed to the application, allowing the
/// frontend to auto-connect and auto-setup based on CLI input.
#[tauri::command]
fn get_cli_args(state: tauri::State<CliArgs>) -> CliArgs {
    state.inner().clone()
}

#[tauri::command]
fn close_application(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

/// Save a schematic file to disk
///
/// Opens a native save file dialog and writes the schematic as YAML.
/// Returns true if saved successfully, false if cancelled.
#[tauri::command]
async fn save_schematic_file(
    app: tauri::AppHandle,
    schematic: SchematicFile,
) -> Result<bool, String> {
    // Validate schematic
    schematic.validate()?;

    // Serialize to YAML
    let yaml = serde_yaml::to_string(&schematic)
        .map_err(|e| format!("Failed to serialize schematic: {}", e))?;

    // Open save dialog with .yaml filter
    let file_path = app
        .dialog()
        .file()
        .add_filter("Ship Schematic", &["yaml", "yml"])
        .set_file_name(&format!("{}.yaml", schematic.name))
        .blocking_save_file();

    // Write file if path selected
    if let Some(path) = file_path {
        let path_str = path.to_string();
        std::fs::write(&path_str, &yaml)
            .map_err(|e| format!("Failed to write file: {}", e))?;
        info!("Saved schematic to: {}", path_str);
        Ok(true)
    } else {
        debug!("Save schematic cancelled by user");
        Ok(false) // User cancelled
    }
}

/// Load a schematic file from disk
///
/// Opens a native file picker dialog and reads a YAML schematic file.
/// Returns the parsed schematic or None if cancelled.
#[tauri::command]
async fn load_schematic_file(app: tauri::AppHandle) -> Result<Option<SchematicFile>, String> {
    // Open file picker dialog
    let file_path = app
        .dialog()
        .file()
        .add_filter("Ship Schematic", &["yaml", "yml"])
        .blocking_pick_file();

    // Read and parse file if selected
    if let Some(path) = file_path {
        let path_str = path.to_string();
        let contents = std::fs::read_to_string(&path_str)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let schematic: SchematicFile = serde_yaml::from_str(&contents)
            .map_err(|e| format!("Failed to parse schematic: {}", e))?;

        schematic.validate()?;
        info!("Loaded schematic from: {}", path_str);
        Ok(Some(schematic))
    } else {
        info!("Load schematic cancelled by user");
        Ok(None) // User cancelled
    }
}

fn main() {
    let cli = Cli::parse();

    // Initialize logging
    let level = parse_log_level(&cli.log_level);
    init_logging(level, cli.log_file);

    info!("Starting Frigate Desktop");
    info!("Log level: {:?}", level);

    // Normalize server URL if provided
    let connect = cli.connect.map(|c| {
        let normalized = normalize_server_url(&c);
        info!("CLI connect: {} -> {}", c, normalized);
        normalized
    });

    // Log other CLI args if provided
    if let Some(ref user) = cli.user {
        info!("CLI user: {}", user);
    }
    if let Some(ref team) = cli.team {
        info!("CLI team: {}", team);
    }
    if let Some(ref faction) = cli.faction {
        info!("CLI faction: {}", faction);
    }
    if let Some(ref ship) = cli.ship {
        info!("CLI ship: {}", ship);
    }
    if let Some(ref ship_class) = cli.ship_class {
        info!("CLI ship_class: {}", ship_class);
    }

    // Create CLI args state for frontend
    let cli_args = CliArgs {
        connect,
        user: cli.user,
        team: cli.team,
        faction: cli.faction,
        ship: cli.ship,
        ship_class: cli.ship_class,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(cli_args)
        .invoke_handler(tauri::generate_handler![
            close_application,
            js_log,
            get_cli_args,
            save_schematic_file,
            load_schematic_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Frigate Tauri application");
}
