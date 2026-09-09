use std::error::Error;
use std::fs;
use std::env;
use std::path::Path;
use std::process::{exit, Command};

// This calls buf manually and generates protocol buffers in OUT_DIR. The existing tooling
// (prost-build) supports buf but still depends on protoc, so we chose to avoid it.
fn main() -> Result<(), Box<dyn Error>> {
    let buf = env::var("BUF_BINARY").unwrap_or("buf".to_string());
    let bufbuild_outdir = env::var("OUT_DIR").unwrap() + "/bufbuild";
    let bufbuild_path = Path::new(&bufbuild_outdir);
    if bufbuild_path.is_dir() { fs::remove_dir_all(bufbuild_outdir.clone()).unwrap(); }
    fs::create_dir_all(bufbuild_path).unwrap();
    let bufgen = fs::read_to_string("buf.cargo.gen.yaml").unwrap();
    let bufgen_outdir_path = bufbuild_outdir.clone() + "/buf.cargo.gen.yaml";
    let gendir = "placeholder/bufbuild";  // keep in sync with buf.cargo.gen.yaml
    let bufgen_outdir_contents = bufgen.replace(gendir, &bufbuild_outdir.clone());
    fs::write(bufgen_outdir_path.clone(), bufgen_outdir_contents).unwrap();
    let status = Command::new(buf)
        .arg("generate").arg("--template").arg(bufgen_outdir_path)
        .arg("--include-imports").arg("--include-wkt")
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .status()
        .unwrap();

    if !status.success() {
        exit(status.code().unwrap_or(-1));
    }
    println!("cargo:rerun-if-changed=trash");
    println!("cargo:rerun-if-changed=boxer");
    println!("cargo:rerun-if-changed=buf.cargo.gen.yaml");
    Ok(())
}
