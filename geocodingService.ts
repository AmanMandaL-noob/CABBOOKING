/**
 * Geocoding Service
 * Provides forward and reverse geocoding functionality using Nominatim API
 */

interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
}

class GeocodingService {
  private nominatimUrl = "https://nominatim.openstreetmap.org";
  private customGeocoder = "https://photon.komoot.io"; // Fallback geocoder

  /**
   * Forward geocoding: converts address string to coordinates
   */
  async forward(address: string): Promise<GeocodeResult[]> {
    if (!address || address.trim().length === 0) {
      return [];
    }

    try {
      // Try Photon API first (faster, more lenient)
      const photonResponse = await fetch(
        `${this.customGeocoder}/api?q=${encodeURIComponent(address)}&limit=5`
      );

      if (photonResponse.ok) {
        const data = await photonResponse.json();
        if (data.features && data.features.length > 0) {
          return data.features.map((feature: any) => ({
            label: feature.properties.name || feature.properties.label || address,
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0]
          }));
        }
      }

      // Fallback to Nominatim if Photon fails
      const nominatimResponse = await fetch(
        `${this.nominatimUrl}/search?q=${encodeURIComponent(
          address
        )}&format=json&limit=5`
      );

      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            label: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
          }));
        }
      }

      return [];
    } catch (error) {
      console.error("Geocoding forward error:", error);
      return [];
    }
  }

  /**
   * Reverse geocoding: converts coordinates to address
   */
  async reverse(latitude: number, longitude: number): Promise<GeocodeResult[]> {
    if (latitude === null || longitude === null) {
      return [];
    }

    try {
      // Try Nominatim reverse geocoding
      const response = await fetch(
        `${this.nominatimUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          const address = data.display_name || data.address.name || "Unknown Location";
          return [
            {
              label: address,
              latitude,
              longitude
            }
          ];
        }
      }

      // Fallback to Photon if Nominatim fails
      const photonResponse = await fetch(
        `${this.customGeocoder}/reverse?lat=${latitude}&lon=${longitude}`
      );

      if (photonResponse.ok) {
        const data = await photonResponse.json();
        if (data.features && data.features.length > 0) {
          return data.features.map((feature: any) => ({
            label: feature.properties.name || feature.properties.label || "Unknown Location",
            latitude,
            longitude
          }));
        }
      }

      return [];
    } catch (error) {
      console.error("Geocoding reverse error:", error);
      return [];
    }
  }
}

export const geocodingService = new GeocodingService();
