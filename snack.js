async function getDashboardData(query) {
    try {
        // Gestisco le 3 richieste in parallelo ritornando una promessa 
        // che si risolve sia se le richieste sono positive che negative
        const responses = await Promise.allSettled([
            fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/destinations?search=${query}`),
            fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/weathers?search=${query}`),
            fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/airports?search=${query}`)
        ]);

        const apiNames = ["Destinations", "Weathers", "Airports"];

        // Stampo un messaggio di errore specifico per ogni richiesta fallita
        responses.forEach((response, index) => {
            if (response.status === "rejected") {
                console.error(`Errore nella chiamata API: ${apiNames[index]}`, response.reason);
            }
        });

        // Promise.all per attendere che si risolvano tutte le promesse.
        // così ogni promessa si risolve: 
        // Ritornando il json se sono positive, altrimenti risolvo la promise con valore null
        const data = await Promise.all(
            responses.map(response => response.status === 'fulfilled' ? response.value.json() : Promise.resolve(null))
        );

        // Se ho ricevuto un JSON lo uso per creare l'oggetto da ritornare
        // come risultato finale della funzione
        const [destinations, weathers, airports] = data;

        return {
            city: destinations?.[0]?.name ?? null,
            country: destinations?.[0]?.country ?? null,
            temperature: weathers?.[0]?.temperature ?? null,
            weather: weathers?.[0]?.weather_description ?? null,
            airport: airports?.[0]?.name ?? null
        };
    } catch (error) {
        console.error("Errore generale nel recupero dei dati della dashboard:", error);
        return null;
    }
}

(async () => {
    try {
        const data = await getDashboardData('london');
        console.log('Dashboard data:', data);
        if (data) {
            console.log(
                (data.city !== null && data.country !== null
                    ? `${data.city} is in ${data.country}.`
                    : '') +
                (data.temperature !== null && data.weather !== null
                    ? `Today there are ${data.temperature} degrees and the weather is ${data.weather}.`
                    : '') +
                (data.airport !== null
                    ? `The main airport is ${data.airport}.`
                    : '')
            );
        }
    } catch (error) {
        console.error("Errore nell'esecuzione dello script:", error);
    }
})();
