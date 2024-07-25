$(document).ready(function () {

    // ------------------------------------------------------------------------------------------------------------
    ///// Méthodes

    // Efface l'icone de chargement une fois la carte chargée
	function chargement_carte () {
        console.log('Carte chargée !');
		setTimeout(() => {
            // Cache le loader et affiche la carte une fois le chargement terminé
            document.getElementById('loader').style.display = 'none';     
        }, 3000);               
	};


    /// Panneau latéral
    // Fonction pour ouvrir/fermer le panneau
    function togglePanel() {
        const panel = document.getElementById("panel");
        const mapContainer = document.getElementById("map");
        const isOpen = panel.style.width === "250px";
    
        if (isOpen) {
            // Fermer le panneau
            panel.style.width = "0";
            mapContainer.style.width = "100%";
            document.querySelector('.openbtn').innerHTML = "☰ Ouvrir Panneau";
        } else {
            // Ouvrir le panneau
            panel.style.width = "250px";
            mapContainer.style.width = "calc(100% - 250px)";
            document.querySelector('.openbtn').innerHTML = "✖ Fermer Panneau";
        }
    }

    var bt_demarche = document.getElementById('bt_demarches');

    bt_demarche.addEventListener("click", () => {
        togglePanel();
    });


    // ------------------------------------------------------------------------------------------------------------
    ///// Création de l'objet carte 
        
    // Configuration de la carte :
    let config = {
        minZoom: 7, // dézoomé
        maxZoom: 18, // zoomé
    };
    // 	Création de la carte (coordonnées de centrage et zoom)
    var map = L.map('map',config).setView([43.70188, 2.13676], 8); 
    
    // Ajout de la fonctionnalité plein-écran
    //   map.addControl(new L.Control.Fullscreen({
    //       title: {
    //           'false': 'Plein-écran',
    //           'true': 'Quitter plein-écran'
    //           }
    //   }));


    // --------------------------------------------------------------------------------------------------------------
    ///// Affichage du fond OpenStreetMap

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // --------------------------------------------------------------------------------------------------------------
    /////  Couche bassin métropole (EPSG:4326)

    const bassin_metropole = L.geoJSON(null,{
        color:'rgb(113,151,141)',
        weight:2,
        fill:false
    });
    $.getJSON('data/bassins_oc.geojson', function(data){
        bassin_metropole.addData(data).addTo(map);
    });
                
    // --------------------------------------------------------------------------------------------------------------
    ///// Couche département (EPSG:4326)

    const departement = L.geoJSON(null,{
        color:'rgb(108,188,165)',
        weight:2,
        fill:false
    });
    $.getJSON('data/dep_oc.geojson', function(data){
        departement.addData(data).addTo(map);
    });

    // --------------------------------------------------------------------------------------------------------------
    ///// Couche région (EPSG:4326)
    const region = L.mask('data/region_oc.geojson', {
        fitBounds: false,
        restrictBounds: false,
        fillOpacity: 0.5,
        stroke : 0
    }).addTo(map);

    // --------------------------------------------------------------------------------------------------------------
    ///// Couche Démarches (EPSG:4326)

    /// Interactions sur les démarches (onEachFeature)

    // Action lors du survol avec la souris d'une entité polygonale
	function highlightFeature(e) {
		var layer = e.target;
        layer.setStyle({
    		weight: 5,
    		color: '#FD0000',
    		dashArray: '',
    		fillOpacity: 0.3
        });
	}

    // Fin de l'action du survol avec la souris
	function resetHighlight(e) {
        demarches.resetStyle(e.target);
    };

    // Appliqué à chaque démarche
	function onEachFeature_demarches(feature, layer) {

        //layer._leaflet_id = feature.properties.nom; // on désigne le nom de la commune comme l'identifiant de l'entité
    
        // layer.bindPopup(popup_content(feature,'Commune','commune',true));
    
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            //click: zoomToFeature
        });
    };

    /// Style
    function style_demarches (feature) {
        var style;
        // Démarches en cours ou en élaboration
        if (feature.properties.type !== 'AAC' && feature.properties.statut !== 'Terminée' ) {
            style = {
                color:'rgb(000,124,142)',
                weight:1,
                fillColor: 'rgb(000,124,142)',
                fillOpacity: 0.5,
            }
        // Démarches terminées
        } else if (feature.properties.type !== 'AAC' && feature.properties.statut === 'Terminée') {
            style = {
                color:'rgb(000,124,89)',
                weight:1,
                fillColor: 'rgb(000,124,89)',
                fillOpacity: 0.5,
            }
        // AAC
        } else {
            style = {
                color:'rgb(87,107,53)',
                weight:1,
                fillColor: 'rgb(87,107,53)',
                fillOpacity: 0.5,
            }
        }
        return style;
    }

    const demarches = L.geoJSON(null,{
        style: style_demarches,
        onEachFeature: onEachFeature_demarches,
    });
    $.getJSON('data/demarches.geojson', function(data){
        console.log(data);
        demarches.addData(data).addTo(map);
    });

    // --------------------------------------------------------------------------------------------------------------
    ///// Captages (EPSG:4326)

    // Récupérer le chemin de l'icone
    function getIconPath (type_captage) {
        return (type_captage === 'Sensible') ? 'assets/images/goutte_j.png' : 'assets/images/goutte_b.png';
    }

    // Construcion du marqueur de la couche des captages (prioritaire ou sensible)
    function captageIcon (type_captage) {
        var chemin_icone = getIconPath(type_captage);
        return new L.Icon({
            iconUrl: chemin_icone,
            iconSize: [15, 15],
            // iconAnchor: [0, 0],
            popupAnchor: [0, 0]
        });
    }

    // Survol captage
    function highlightMarker(e) {
        var marker = e.target;
        const icon = new L.Icon({
            iconUrl: getIconPath(marker.feature.properties.type_captage),
		    iconSize: [30, 30],
            iconAnchor: [15, 15], // permet de garder l'icone centré
            popupAnchor: [0, 0]
         });
        marker.setIcon(icon);
    }

    function resetHighlightMarker(e) {
        var marker = e.target;
        const icon = new L.Icon({
            iconUrl: getIconPath(marker.feature.properties.type_captage),
		    iconSize: [15, 15],
            // iconAnchor: [0, 0],
            popupAnchor: [0, 0]
        });
        marker.setIcon(icon);
    }

    function onEachFeature_captage(feature, layer){
        // layer.bindPopup(popup_content(feature,'Établissement de tourisme et de loisir','camping',false)
        // );
        layer.on({
            // click : clickZoom,
            mouseover : highlightMarker,
            mouseout : resetHighlightMarker,
          });

    }

    const captages = L.geoJSON(null, {
        onEachFeature : onEachFeature_captage,
        pointToLayer: function (feature, latlng){
            return L.marker(latlng, {icon: captageIcon(feature.properties.type_captage)})}
    });

    // Gestion de l'affichage en fonction de l'échelle
    function updateGeoJSONLayerVisibility() {
        if (map.getZoom() < 11) {
            if (!map.hasLayer(captages)) {
                map.addLayer(captages);
                map.removeControl(layerHiddenControl); // enlever le message d'occultation
            }
        } else {
            if (map.hasLayer(captages)) {
                map.removeLayer(captages);
                map.addControl(layerHiddenControl); // ajouter le message d'occultation
            }
        }
    }

    // Message d'occultation de la couche
    var LayerHiddenControl = L.Control.extend({
        onAdd: function(map) {
            var div = L.DomUtil.create('div', 'layer-hidden-control');
            div.innerHTML = "Captages occultés. Dézoomer pour les visualiser.";
            return div;
        },
        onRemove: function(map) {
            // Pas d'action particulière à réaliser lors du retrait
        }
    });

    // Ajouter le contrôle à la carte (mais il sera visible seulement quand nécessaire)
    var layerHiddenControl = new LayerHiddenControl({ position: 'bottomright' });


    $.getJSON('data/captages.geojson', function(data){
        captages.addData(data).addTo(map);
        updateGeoJSONLayerVisibility();
    });

    // Mise à jour de la visibilité de la carte lors du zoom / dézoom
    map.on('zoomend', updateGeoJSONLayerVisibility);


    map.whenReady(chargement_carte); // une fois la carte chargee, on efface l'icone de chargement

}); // fin JQuery