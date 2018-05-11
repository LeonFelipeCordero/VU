package ph.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GoogleMapsServiceImpl implements GoogleMapsService {

    private InternalAPIService internalAPIService;

    @Autowired
    public GoogleMapsServiceImpl(InternalAPIService internalAPIService){
        this.internalAPIService = internalAPIService;
    }

    @Override
    public String getApiKey(){
        return internalAPIService.getKey();
    }

    @Override
    public String getApiKeyForPlaces() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                internalAPIService.getKey() +
                "&callback=initMap&libraries=places,visualization";
    }

    @Override
    public String getApiKeyForVisualizations() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                internalAPIService.getKey() +
                "&callback=initMap&libraries=visualization,places";
    }

    @Override
    public String getApiKetForAutoComplete() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                internalAPIService.getKey() +
                "&callback=initAutocomplete&libraries=places";
    }
}
