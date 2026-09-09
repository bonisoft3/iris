// Manually include all generated protos. Can be replaced by crate from
// ttps://github.com/neoeinstein/protoc-gen-prost/blob/main/protoc-gen-prost-crate/README.md
// but we avoid it for now to keep protoc dependencies away.
pub mod google {
    pub mod protobuf {
      include!(concat!(env!("OUT_DIR"), "/bufbuild/src/google.protobuf.rs"));
    }
    pub mod r#type {
      include!(concat!(env!("OUT_DIR"), "/bufbuild/src/google.type.rs"));
    }
}
pub mod trash {
    pub mod tracker {
        pub mod v1 {
            include!(concat!(env!("OUT_DIR"), "/bufbuild/src/trash.tracker.v1.rs"));
        }
    }
}
pub mod boxer {
    pub mod v1 {
        include!(concat!(env!("OUT_DIR"), "/bufbuild/src/boxer.v1.rs"));
    }
}
