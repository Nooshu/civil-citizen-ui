provider "azurerm" {
  features {}
  # v5 defaults to none; set explicitly so behaviour matches HMCTS / private_endpoint alias
  resource_provider_registrations = "none"
}

provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
  alias                           = "private_endpoint"
  subscription_id                 = var.aks_subscription_id
}

terraform {
  required_version = ">= 0.15" # Terraform client version

  backend "azurerm" {}

  required_providers {
    azuread = {
      source  = "hashicorp/azuread"
      version = "3.9.0"
    }

    random = {
      source = "hashicorp/random"
    }

    azurerm = {
      source  = "hashicorp/azurerm"
      version = "5.0.1"
    }
  }
}
