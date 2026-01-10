provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "wafir-rg"
  location = "West Europe"
}

resource "azurerm_service_plan" "app_plan" {
  name                = "wafir-app-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "api" {
  name                = "wafir-api"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
  }
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "wafir-db"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "15"
  administrator_login    = "wafiradmin"
  administrator_password = "ChangeMe123!"
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
}
