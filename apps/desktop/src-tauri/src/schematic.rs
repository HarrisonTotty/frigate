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

    #[test]
    fn test_schematic_validation_error_messages() {
        let invalid_version = SchematicFile {
            version: 2,
            name: "Test".to_string(),
            ship_class: "frigate".to_string(),
            modules: vec![],
        };
        let err = invalid_version.validate().unwrap_err();
        assert!(err.contains("Unsupported schematic version"));
        assert!(err.contains("2"));

        let empty_name = SchematicFile {
            version: 1,
            name: String::new(),
            ship_class: "frigate".to_string(),
            modules: vec![],
        };
        let err = empty_name.validate().unwrap_err();
        assert!(err.contains("name cannot be empty"));

        let empty_class = SchematicFile {
            version: 1,
            name: "Test".to_string(),
            ship_class: String::new(),
            modules: vec![],
        };
        let err = empty_class.validate().unwrap_err();
        assert!(err.contains("Ship class cannot be empty"));
    }

    #[test]
    fn test_schematic_with_many_modules() {
        let modules: Vec<SchematicModule> = (0..100)
            .map(|i| SchematicModule {
                slot: format!("slot-{}", i),
                module: if i % 2 == 0 {
                    Some(format!("module-{}", i))
                } else {
                    None
                },
            })
            .collect();

        let schematic = SchematicFile {
            version: 1,
            name: "Large Ship".to_string(),
            ship_class: "dreadnought".to_string(),
            modules,
        };

        assert!(schematic.validate().is_ok());

        // Round-trip serialization
        let yaml = serde_yaml::to_string(&schematic).unwrap();
        let parsed: SchematicFile = serde_yaml::from_str(&yaml).unwrap();

        assert_eq!(parsed.modules.len(), 100);
        assert_eq!(parsed.modules[0].module, Some("module-0".to_string()));
        assert_eq!(parsed.modules[1].module, None);
        assert_eq!(parsed.modules[50].module, Some("module-50".to_string()));
    }

    #[test]
    fn test_schematic_special_characters_in_name() {
        let schematic = SchematicFile {
            version: 1,
            name: "Ship: The 'Ultimate' Test!".to_string(),
            ship_class: "cruiser".to_string(),
            modules: vec![],
        };

        assert!(schematic.validate().is_ok());

        let yaml = serde_yaml::to_string(&schematic).unwrap();
        let parsed: SchematicFile = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.name, "Ship: The 'Ultimate' Test!");
    }

    #[test]
    fn test_schematic_module_clone() {
        let module = SchematicModule {
            slot: "power-core".to_string(),
            module: Some("fusion-reactor".to_string()),
        };

        let cloned = module.clone();
        assert_eq!(cloned.slot, module.slot);
        assert_eq!(cloned.module, module.module);
    }

    #[test]
    fn test_schematic_file_clone() {
        let schematic = SchematicFile {
            version: 1,
            name: "Original".to_string(),
            ship_class: "frigate".to_string(),
            modules: vec![SchematicModule {
                slot: "engine".to_string(),
                module: Some("ion-drive".to_string()),
            }],
        };

        let cloned = schematic.clone();
        assert_eq!(cloned.version, schematic.version);
        assert_eq!(cloned.name, schematic.name);
        assert_eq!(cloned.ship_class, schematic.ship_class);
        assert_eq!(cloned.modules.len(), schematic.modules.len());
    }

    #[test]
    fn test_current_version_constant() {
        assert_eq!(SchematicFile::CURRENT_VERSION, 1);
    }

    #[test]
    fn test_schematic_deserialization_from_yaml_string() {
        let yaml = r#"
version: 1
name: My Ship
ship_class: corvette
modules:
  - slot: power-core
    module: fusion-mk1
  - slot: shield
    module: null
"#;

        let schematic: SchematicFile = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(schematic.version, 1);
        assert_eq!(schematic.name, "My Ship");
        assert_eq!(schematic.ship_class, "corvette");
        assert_eq!(schematic.modules.len(), 2);
        assert_eq!(schematic.modules[0].slot, "power-core");
        assert_eq!(schematic.modules[0].module, Some("fusion-mk1".to_string()));
        assert_eq!(schematic.modules[1].slot, "shield");
        assert_eq!(schematic.modules[1].module, None);
    }

    #[test]
    fn test_schematic_empty_modules_list() {
        let schematic = SchematicFile {
            version: 1,
            name: "Empty Ship".to_string(),
            ship_class: "shuttle".to_string(),
            modules: vec![],
        };

        assert!(schematic.validate().is_ok());

        let yaml = serde_yaml::to_string(&schematic).unwrap();
        let parsed: SchematicFile = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.modules.len(), 0);
    }
}
