package ph.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import ph.backend.rest.template.BasicAuthRestTemplate;

@Service
public class InternalAPIServiceImpl implements InternalAPIService {

    private BasicAuthRestTemplate template;
    private Environment environment;


    @Autowired
    public InternalAPIServiceImpl(BasicAuthRestTemplate template, Environment environment) {
        this.template = template;
        this.environment = environment;
    }

    @Override
    public String getKey() {
        return template.getForObject("http://" +  environment.getProperty("api.host") + ":8082/map-key", String.class);
    }
}
