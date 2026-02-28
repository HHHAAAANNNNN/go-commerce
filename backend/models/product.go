package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// Decimal type for handling MySQL DECIMAL
type Decimal float64

func (d *Decimal) Scan(value interface{}) error {
	switch v := value.(type) {
	case float64:
		*d = Decimal(v)
		return nil
	case []byte:
		*d = Decimal(0)
		return nil
	case nil:
		*d = Decimal(0)
		return nil
	default:
		return fmt.Errorf("cannot convert %T to Decimal", value)
	}
}

func (d Decimal) Value() (driver.Value, error) {
	return float64(d), nil
}

// ProductSpec is a single key-value specification row
type ProductSpec struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Product struct {
	ID             int           `json:"id"`
	Name           string        `json:"name"`
	Price          int           `json:"price"`
	Stock          int           `json:"stock"`
	Category       string        `json:"category"`
	Rating         Decimal       `json:"rating"`
	Description    string        `json:"description,omitempty"`
	Image          string        `json:"image,omitempty"`
	Brand          string        `json:"brand,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
	Specifications []ProductSpec `json:"specifications,omitempty"`
}

type ProductCreateRequest struct {
	Name        string  `json:"name"`
	Price       int     `json:"price"`
	Stock       int     `json:"stock"`
	Category    string  `json:"category"`
	Rating      float64 `json:"rating"`
	Description string  `json:"description"`
	Image       string  `json:"image"`
	Brand       string  `json:"brand"`
	// Smartphone specs
	Chipset          string  `json:"chipset"`
	RamGB            int     `json:"ram_gb"`
	RamDdr           string  `json:"ram_ddr"`
	RomValue         int     `json:"rom_value"`
	RomUnit          string  `json:"rom_unit"`
	StorageType      string  `json:"storage_type"`
	DisplayInch      float64 `json:"display_inch"`
	RefreshRateHz    int     `json:"refresh_rate_hz"`
	Battery          string  `json:"battery"`
	Charging         string  `json:"charging"`
	Camera           string  `json:"camera"`
	Connectivity5G   bool    `json:"connectivity_5g"`
	ConnectivityWifi bool    `json:"connectivity_wifi"`
	ConnectivityNfc  bool    `json:"connectivity_nfc"`
	OsName           string  `json:"os_name"`
	OsVersion        string  `json:"os_version"`
}

type ProductUpdateRequest struct {
	Name        string  `json:"name,omitempty"`
	Price       int     `json:"price,omitempty"`
	Stock       int     `json:"stock,omitempty"`
	Category    string  `json:"category,omitempty"`
	Rating      float64 `json:"rating,omitempty"`
	Description string  `json:"description,omitempty"`
	Image       string  `json:"image,omitempty"`
	Brand       string  `json:"brand,omitempty"`
}
