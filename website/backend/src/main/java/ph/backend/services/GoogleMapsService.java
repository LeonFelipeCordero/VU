package ph.backend.services;

import ph.backend.dto.Key;

public interface GoogleMapsService {
    String getApiKey();

    String getApiKeyForPlaces();

    //
    String getApiKeyForVisualizations();

    String getApiKetForAutoComplete();
}
