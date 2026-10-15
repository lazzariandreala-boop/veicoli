// Testi legali mostrati nell'app (/privacy e /termini). Prima della pubblicazione sostituire i segnaposto
// tra parentesi quadre e farli rivedere da un professionista.
export const LEGAL = {
  owner: '[Nome e cognome o ragione sociale del titolare]',
  address: '[Indirizzo del titolare]',
  email: '[email di contatto]',
  updated: '15 ottobre 2026',
  price: '9,99 €',
}

export type LegalSection = { h: string; p: string[] }

export const PRIVACY: LegalSection[] = [
  { h: 'Chi tratta i tuoi dati', p: [
    `Il titolare del trattamento è ${LEGAL.owner}, ${LEGAL.address}. Per qualsiasi domanda sulla privacy scrivi a ${LEGAL.email}.`,
    'Questa informativa spiega quali dati usa l\'app Veicoli Personali, perché li usa e quali diritti hai, come previsto dal Regolamento UE 2016/679 (GDPR).',
  ] },
  { h: 'Quali dati usiamo', p: [
    '• Account: quando accedi con Google riceviamo nome, indirizzo email, foto del profilo e un codice identificativo dell\'account. Non riceviamo la tua password.',
    '• Dati dei veicoli che inserisci: marca, modello, targa, dati del libretto, chilometri, bollo, polizze, revisioni, lavori, spese, incidenti e note. Restano sul telefono e una copia viene salvata nel cloud per ritrovarli su altri dispositivi.',
    '• Foto: la foto del veicolo viene salvata nel cloud solo con Premium. Le foto e i PDF dei documenti (libretto, polizze, fatture) restano solo sul telefono.',
    '• Lettura dei documenti: il testo di libretti e documenti viene letto direttamente sul telefono. Le immagini non vengono inviate a nessun server per la lettura.',
    '• Abbonamento: se acquisti Premium riceviamo da Google Play o App Store, tramite RevenueCat, lo stato dell\'abbonamento, il codice dell\'acquisto e la data di rinnovo. Non vediamo mai i dati della tua carta o del tuo metodo di pagamento.',
    '• Segnalazione errori: se l\'app si blocca o va in errore inviamo un rapporto tecnico (modello e sistema del telefono, versione dell\'app, dettagli dell\'errore e codice del tuo account) per poterlo correggere.',
    '• Notifiche: i promemoria delle scadenze vengono programmati sul telefono e non passano dai nostri server.',
  ] },
  { h: 'Dati di altre persone', p: [
    'Nel registro incidenti puoi annotare nome, targa e assicurazione della controparte. Inserisci solo quello che ti serve per gestire il sinistro: questi dati sono trattati solo per conto tuo e non vengono usati per altri scopi.',
  ] },
  { h: 'Perché li usiamo e su quale base', p: [
    '• Far funzionare l\'app, salvare e sincronizzare i tuoi dati: esecuzione del contratto (art. 6.1.b GDPR).',
    '• Gestire l\'abbonamento Premium: esecuzione del contratto e obblighi di legge, anche fiscali (art. 6.1.b e 6.1.c).',
    '• Correggere errori e mantenere l\'app sicura: legittimo interesse (art. 6.1.f). Puoi opporti scrivendoci.',
    'Non usiamo i tuoi dati per pubblicità, non li vendiamo e non creiamo profili commerciali.',
  ] },
  { h: 'A chi li affidiamo', p: [
    '• Google Ireland Ltd (Firebase Authentication, Cloud Firestore e Crashlytics): accesso, archivio cloud e rapporti di errore. Il database si trova in Europa (eur3).',
    '• RevenueCat Inc. (Stati Uniti): gestione degli abbonamenti. Il trasferimento avviene sulla base dell\'EU-US Data Privacy Framework o delle clausole contrattuali standard della Commissione europea.',
    '• Google Play e Apple App Store gestiscono il pagamento come titolari autonomi, secondo le loro informative.',
    'Questi fornitori trattano i dati solo per offrire i loro servizi all\'app.',
  ] },
  { h: 'Per quanto tempo', p: [
    '• I dati dell\'account e dei veicoli restano finché tieni l\'account. Se lo elimini dall\'app (Profilo → Elimina account) li cancelliamo subito dal cloud e dal telefono.',
    '• I rapporti di errore vengono cancellati automaticamente dopo 90 giorni.',
    '• I dati sugli acquisti sono conservati dagli store e da RevenueCat per il tempo richiesto dalla legge.',
  ] },
  { h: 'I tuoi diritti', p: [
    'Puoi chiedere in ogni momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne l\'uso, opporti al trattamento e riceverli in un formato leggibile. Molte di queste cose le puoi fare da solo nell\'app: modificare i dati, esportarli con il backup ed eliminare l\'account.',
    `Per il resto scrivi a ${LEGAL.email}: rispondiamo entro 30 giorni. Se ritieni che i tuoi dati siano trattati in modo scorretto puoi presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).`,
  ] },
  { h: 'Sicurezza', p: [
    'I dati viaggiano cifrati e le regole del database permettono a ogni account di leggere e scrivere solo i propri dati. Nessun sistema è sicuro al 100%: ti consigliamo di proteggere il telefono con un blocco schermo.',
  ] },
  { h: 'Minori', p: [
    'L\'app non è rivolta ai minori di 14 anni. Gli acquisti richiedono la maggiore età o il consenso di un genitore.',
  ] },
  { h: 'Modifiche', p: [
    'Se cambiamo questa informativa aggiorniamo la data qui sotto e, per le modifiche importanti, te lo segnaliamo nell\'app.',
  ] },
]

export const TERMS: LegalSection[] = [
  { h: 'Il servizio', p: [
    `Veicoli Personali è un\'app per tenere in ordine i dati dei tuoi veicoli: libretto, scadenze, lavori e spese. È offerta da ${LEGAL.owner} (${LEGAL.email}). Usando l\'app accetti questi termini.`,
  ] },
  { h: 'Account', p: [
    'Per usare l\'app serve un account Google. Sei responsabile di quello che succede con il tuo account e di tenere al sicuro il telefono. Puoi eliminare l\'account quando vuoi da Profilo → Elimina account.',
  ] },
  { h: 'Piano gratuito e Premium', p: [
    '• Il piano gratuito permette di registrare un veicolo con i dati del libretto e la foto.',
    `• Premium sblocca scadenze di bollo, assicurazione e revisione, notifiche, lavori, documenti, spese, report, incidenti, veicoli illimitati e la foto nel cloud. Costa ${LEGAL.price} all'anno, IVA inclusa (il prezzo nella tua valuta è indicato dallo store prima dell'acquisto).`,
    '• L\'abbonamento si rinnova automaticamente ogni anno, salvo disdetta almeno 24 ore prima della scadenza dalle impostazioni di Google Play o App Store. Disinstallare l\'app o eliminare l\'account non disdice l\'abbonamento.',
    '• Pagamenti e rimborsi sono gestiti da Google Play o App Store secondo le loro condizioni. Se disdici, Premium resta attivo fino alla fine del periodo già pagato.',
    '• Quando Premium scade i tuoi dati non vengono cancellati: restano nell\'app ma le funzioni Premium tornano bloccate finché non rinnovi.',
    '• Possiamo cambiare il prezzo per i rinnovi futuri avvisandoti prima, come previsto dagli store: potrai sempre disdire.',
  ] },
  { h: 'Diritto di recesso', p: [
    'Premium è un contenuto digitale fornito subito dopo l\'acquisto. Acquistandolo chiedi l\'attivazione immediata e accetti di perdere il diritto di recesso di 14 giorni previsto dall\'art. 59 del Codice del consumo, salvo quanto concesso dalle politiche di rimborso dello store.',
  ] },
  { h: 'Come usare l\'app', p: [
    'I dati letti in automatico da libretti e documenti e le date calcolate dall\'app possono contenere errori: controllali sempre. L\'app è un promemoria e non sostituisce i documenti ufficiali né le verifiche presso ACI, Motorizzazione, Portale dell\'automobilista o la tua assicurazione.',
    'Le notifiche dipendono dalle impostazioni del telefono (risparmio energetico, permessi): non possiamo garantire che arrivino sempre. Non rispondiamo di sanzioni, more o danni dovuti a scadenze mancate.',
    'Non usare l\'app per scopi illegali e non inserire dati di altre persone senza averne il diritto.',
  ] },
  { h: 'I tuoi contenuti', p: [
    'I dati, le foto e i documenti che inserisci restano tuoi. Ci autorizzi a conservarli e copiarli solo per farli funzionare nell\'app e sincronizzarli tra i tuoi dispositivi. Ti consigliamo di fare ogni tanto un backup dal Profilo.',
  ] },
  { h: 'Disponibilità e responsabilità', p: [
    'Facciamo il possibile perché l\'app funzioni sempre, ma può avere interruzioni o errori. Nei limiti consentiti dalla legge rispondiamo solo per dolo o colpa grave. Restano salvi i diritti che il Codice del consumo riconosce ai consumatori.',
  ] },
  { h: 'Licenze', p: [
    'Il modello 3D dell\'auto è "Car Concept" dai glTF Sample Assets di Khronos, basato sul modello di Unity Fan, con licenza CC BY 4.0.',
  ] },
  { h: 'Modifiche e chiusura', p: [
    'Possiamo aggiornare questi termini: ti avviseremo nell\'app delle modifiche importanti. Possiamo sospendere un account che viola questi termini. Se un giorno l\'app venisse chiusa ti avviseremo in tempo per esportare i dati.',
  ] },
  { h: 'Legge applicabile', p: [
    'Si applica la legge italiana. Per le controversie con i consumatori è competente il tribunale del luogo di residenza del consumatore.',
  ] },
]
