package it.veicoli.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Senza google-services.json Firebase non si avvia da solo e il plugin di login chiuderebbe l'app:
        // in quel caso lo avvio con la configurazione web (il login Google nativo resta da configurare).
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(
                this,
                new FirebaseOptions.Builder()
                    .setApiKey("AIzaSyBCZDcFg5eo0r0zLNgU6jFYObaJEwf40tg")
                    .setApplicationId("1:968907722695:web:be94b7f34c926674c353e2")
                    .setProjectId("veicoli-personali")
                    .setGcmSenderId("968907722695")
                    .setStorageBucket("veicoli-personali.firebasestorage.app")
                    .build()
            );
        }
        super.onCreate(savedInstanceState);
    }
}
