/* Ad esempio:


🎯 Bonus 2 - Chiamate fallite
Attualmente, se una delle chiamate fallisce, **Promise.all()** rigetta l'intera operazione.

Modifica `getDashboardData()` per usare **Promise.allSettled()**, in modo che:

    Se una chiamata fallisce, i dati relativi a quella chiamata verranno settati a null.
    Stampa in console un messaggio di errore per ogni richiesta fallita.
    Testa la funzione con un link fittizio per il meteo (es. https://www.meteofittizio.it).

*/

function getDashboardData(query) {
    return Promise.allSettled([
        fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/destinations?search=${query}`),
        fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/weathers?search=${query}`),
        fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/airports?search=${query}`)
    ])
        .then(responses => {
            // Stampo un messaggio di errore per ogni richiesta fallita
            responses.forEach((response, index) => {
                if (response.status === "rejected") {
                    const apiNames = ["Destinations", "Weathers", "Airports"];
                    console.error(` Errore nella chiamata API: ${apiNames[index]}`, response.reason);
                }
            });

            // Promise.all per attendere che si risolvano tutte le promesse. Se sono positive ritorno il json, altrimenti risolvo con null
            return Promise.all(responses.map(response =>
                response.status === 'fulfilled' ? response.value.json() : Promise.resolve(null)
            ));
        })
        .then(data => {
            const [destinations, weathers, airports] = data;

            return {
                city: destinations && destinations.length > 0 ? destinations[0].name : null,
                country: destinations && destinations.length > 0 ? destinations[0].country : null,
                temperature: weathers && weathers.length > 0 ? weathers[0].temperature : null,
                weather: weathers && weathers.length > 0 ? weathers[0].weather_description : null,
                airport: airports && airports.length > 0 ? airports[0].name : null
            };
        });
}

(async () => {
    try {
        const data = await getDashboardData('london');
        console.log('Dashboard data:', data);
        console.log(
            (data.city !== null && data.country !== null
                ? `${data.city} is in ${data.country}.\n`
                : '') +
            (data.temperature !== null && data.weather !== null
                ? `Today there are ${data.temperature} degrees and the weather is ${data.weather}.\n`
                : '') +
            (data.airport !== null
                ? `The main airport is ${data.airport}.\n`
                : '')
        );
    } catch (error) {
        console.error(error);
    }
})();
