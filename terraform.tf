terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "glenngillen"
    workspaces {
      name = "cli-demo"
    }
  }
}
