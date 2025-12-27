//! Ship Schematic File Support
//!
//! This module provides types and functionality for saving and loading
//! ship schematic files (.yaml). Schematics allow users to save their
//! ship configurations and load them for quick testing or replay.

use serde::{Deserialize, Serialize};

/// A module slot assignment in a schematic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchematicModule {
    /// The slot type ID (e.g., "kinetic-weapon", "power-core")
    pub slot: String,
    /// The module variant ID, or null if no variant selected
    pub module: Option<String>,
}

/// Ship schematic file format
///
/// Represents a saved ship configuration that can be loaded
/// to quickly recreate a ship design.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchematicFile {
    /// File format version
    pub version: u32,
    /// Ship name
    pub name: String,
    /// Ship class ID
    pub ship_class: String,
    /// Module slot assignments
    pub modules: Vec<SchematicModule>,
}

impl SchematicFile {
    /// Current file format version
    pub const CURRENT_VERSION: u32 = 1;

    /// Validate the schematic file
    pub fn validate(&self) -> Result<(), String> {
        if self.version != Self::CURRENT_VERSION {
            return Err(format!(
                "Unsupported schematic version: {} (expected {})",
                self.version,
                Self::CURRENT_VERSION
            ));
        }
        if self.name.is_empty() {
            return Err("Schematic name cannot be empty".to_string());
        }
        if self.ship_class.is_empty() {
            return Err("Ship class cannot be empty".to_string());
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_schematic_serialization() {
        let schematic = SchematicFile {
            version: 1,
            name: "USS Enterprise".to_string(),
            ship_class: "destroyer".to_string(),
            modules: vec![
                SchematicModule {
                    slot: "kinetic-weapon".to_string(),
                    module: Some("autocannon-mk2".to_string()),
                },
                SchematicModule {
                    slot: "power-core".to_string(),
                    module: None,
                },
            ],
        };

        let yaml = serde_yaml::to_string(&schematic).unwrap();
        assert!(yaml.contains("version: 1"));
        assert!(yaml.contains("USS Enterprise"));
        assert!(yaml.contains("kinetic-weapon"));
        assert!(yaml.contains("autocannon-mk2"));

        // Round-trip
        let parsed: SchematicFile = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.name, "USS Enterprise");
        assert_eq!(parsed.modules.len(), 2);
        assert_eq!(parsed.modules[0].module, Some("autocannon-mk2".to_string()));
        assert_eq!(parsed.modules[1].module, None);
    }

    #[test]
    fn test_schematic_validation() {
        let valid = SchematicFile {
            version: 1,
            name: "Test Ship".to_string(),
            ship_class: "frigate".to_string(),
            modules: vec![],
        };
        assert!(valid.validate().is_ok());

        let invalid_version = SchematicFile {
            version: 999,
            name: "Test".to_string(),
            ship_class: "frigate".to_string(),
            modules: vec![],
        };
        assert!(invalid_version.validate().is_err());

        let empty_name = SchematicFile {
            version: 1,
            name: String::new(),
            ship_class: "frigate".to_string(),
            modules: vec![],
        };
        assert!(empty_name.validate().is_err());

        let empty_class = SchematicFile {
            version: 1,
            name: "Test".to_string(),
            ship_class: String::new(),
            modules: vec![],
        };
        assert!(empty_class.validate().is_err());
    }
}
