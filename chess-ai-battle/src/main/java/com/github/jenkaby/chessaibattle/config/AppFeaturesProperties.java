package com.github.jenkaby.chessaibattle.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.features")
public class AppFeaturesProperties {

    private AiPlay aiPlay = new AiPlay();

    public AiPlay getAiPlay() {
        return aiPlay;
    }

    public void setAiPlay(AiPlay aiPlay) {
        this.aiPlay = aiPlay;
    }

    public static class AiPlay {
        private boolean enabled = false;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }
}

