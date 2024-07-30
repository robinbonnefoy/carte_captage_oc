$(document).ready(function () {
    // ------------------------------------------------------------------------------------------------------------
    ///// Constantes

    const panelWidth = "300px";
    const fieldset_captages = document.getElementById('onglet_captages');
    const fieldset_demarches = document.getElementById('onglet_demarches');
    
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

    /// Carte

    // Zoom sur l'entité polygonale sélectionnée
	function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds(),{maxZoom : 12});
    };


    /// Panneau latéral

    // Vérifie si le pannneau latéral est ouvert, et l'ouvre si nécessaire
    function openPanel (){
        const panel = document.getElementById("panel");
        const isOpen = panel.style.width === panelWidth;
        if (!isOpen) {
            togglePanel('open');
        } 
    }

    // Fonction pour ouvrir/fermer le panneau
    function togglePanel(action) {
        const panel = document.getElementById("panel");
        const mapContainer = document.getElementById("map");
        const openButtons = document.querySelectorAll('.openbtn');
        // const isOpen = panel.style.width === panelWidth;
        if (action === 'close') {
            // Fermer le panneau
            panel.style.width = "0";
            mapContainer.style.width = "100%";
            document.querySelector('.openbtn').innerHTML = '<img src="assets/images/demarche.png" alt="Infos Démarches" class="logo_lateral">';
            // Afficher les deux boutons
            openButtons.forEach(button => {
                button.style.display = 'block';
            });
        } else {
            // Ouvrir le panneau
            panel.style.width = panelWidth;
            mapContainer.style.width = "calc(100% - " + panelWidth + ")";
            // Occulter les deux boutons
            openButtons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }

    // Navigation entre les onglets
    function afficherOnglet(ongletId) {
        // Masquer tous les fieldsets
        var fieldsets = document.querySelectorAll('fieldset');
        fieldsets.forEach(function(fieldset) {
            fieldset.style.display = 'none';
        });
        // Afficher le fieldset correspondant à l'onglet sélectionné
        document.getElementById(ongletId).style.display = 'block';
        var boutons = document.querySelectorAll('#onglets button');
        boutons.forEach(function(bouton) {
            bouton.classList.remove('actif');
        });
        var boutonActif = document.querySelector('#onglets button[data-onglet="' + ongletId + '"]');
        boutonActif.classList.add('actif');
    }

    // Paramétrage des deux boutons latéraux
    document.getElementById('bt_demarches').addEventListener("click", () => {
        togglePanel('open');
        afficherOnglet('onglet_demarches');
    });
    document.getElementById('bt_captages').addEventListener("click", () => {
        togglePanel('open');
        afficherOnglet('onglet_captages');
    });

    // Paramétrage du bouton pour fermer le panneau
    document.getElementById('bt_fermer').addEventListener("click", () => {
        togglePanel('close');
    });

    // Paramétrage des bouton Onglets
    document.getElementById('bt_onglet_demarches').addEventListener("click", () => {
        afficherOnglet('onglet_demarches');
    });
    document.getElementById('bt_onglet_captages').addEventListener("click", () => {
        afficherOnglet('onglet_captages');
    });

    // Programme de dépliement et rabbatage de la partie Plus d'information du popup démarches
    function moreInfoAction () {
        // Section - Plus d'information
        const moreInfoButton = document.getElementById('more_info_button');
        const moreInfo = document.getElementById('more_info');
        moreInfoButton.addEventListener('click', function() {
            moreInfo.classList.toggle('open');
        });
        // Section - Aller plus loin
        const moreInfoButton2 = document.getElementById('more_info_button2');
        const moreInfo2 = document.getElementById('more_info2');
        moreInfoButton2.addEventListener('click', function() {
            moreInfo2.classList.toggle('open');
        });

    }

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
        color:'rgb(108,188,165)',
        weight:2,
        fill:false
    });
    $.getJSON('data/bassins_oc.geojson', function(data){
        bassin_metropole.addData(data).addTo(map);
    });
                
    // --------------------------------------------------------------------------------------------------------------
    ///// Couche département (EPSG:4326)

    const departement = L.geoJSON(null,{
        color:'rgb(113,151,141)',
        weight:1,
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
        fillOpacity: 0.7,
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

        //aac.bringToFront();
    };

    // Remplir les infos de la démarche de la Partie "Démarche territoriale"
    function fillDemarcheInfo(feature){
        fieldset_demarches.innerHTML = `
            <p class="popup_demarche_titre"> ${feature.properties.nom} </p>
            <span class="popup_demarche_partie"> Type de démarche </span>
            <span class="popup_info"> ${feature.properties.type} </span>
            <span class="popup_demarche_partie"> Statut de la démarche </span>
             <span class="popup_info"> ${feature.properties.statut} </span>
            <span class="popup_demarche_partie"> Structure en charge de l'animation </span>
            <span class="popup_info"> ${feature.properties.structure_animation} </span>
            <span class="popup_demarche_partie"> Animatrice(teur) </span>
            <span class="popup_info"> ${feature.properties.animateur} </span>
            <span class="popup_info"> ${feature.properties.mail} </span>
            <span class="popup_info"> ${feature.properties.telephone} </span>
            <div class="more_info" id="more_info">
                <div class="more_info_button" id="more_info_button">Plus d'informations</div>
                <div class="more_info_content">
                    <span class="popup_demarche_titre_champs"> Enjeux </span>
                    <span class="popup_info"> ${feature.properties.enjeux_chimique_eau} </span>
                    <span class="popup_demarche_titre_champs"> Nombre de communes intersectées par le périmètre </span>
                    <span class="popup_info"> ${feature.properties.nb_communes_intersectees} </span>
                    <span class="popup_demarche_titre_champs"> Surface du périmètre d'action (ha) </span>
                    <span class="popup_info"> ${feature.properties.surface_zone_action} </span>
                    <span class="popup_demarche_titre_champs"> Année de début de la démarche </span>
                    <span class="popup_info"> ${feature.properties.annee_debut} </span>
                    <span class="popup_demarche_titre_champs"> Nombre de renouvellement </span>
                    <span class="popup_info"> ${feature.properties.nb_renouvellement} </span>
                    <span class="popup_demarche_titre_champs"> Période d'évaluation </span>
                    <span class="popup_info"> ${feature.properties.periode_evaluation} </span>
                    <span class="popup_demarche_titre_champs"> Membre du réseau </span>
                    <span class="popup_info"> ${feature.properties.membre_reseau} </span>
                </div>
            </div>
            <div class="more_info" Id="more_info2">
                <div class="more_info_button" id="more_info_button2">Aller plus loin</div>
                <div class="more_info_content">
                    <span class="popup_demarche_titre_champs2"> Rendez-vous sur  </span>
                    <span class="popup_info2"> <a href="${feature.properties.lien}"  target="_blank"> ${feature.properties.lien}</a> </span>
                </div>
            </div>
        `;
        // Paramétrage du popup (sections rabatues)
        moreInfoAction();
    }

    // Remplir la démarche à partir de l'id_demarche_web
    function fillDemarcheFromIDWeb (idDemarcheWeb){
        demarches.eachLayer(function (layer) {
            // Si le captage est associé à la démarche
            if (layer.feature.properties.id_demarche_web === idDemarcheWeb) {
                // On complète les infos du captage
                fillDemarcheInfo(layer.feature);
            }
        });
    }

    // Remplir l'onglet démarche quand pas de démarches associées au captage
    function fillNoDemarche (nom_ouvrage) {
        fieldset_demarches.innerHTML = `
            <div class="no_demarche"> 
                Si vous avez connaissance d'une démarche en cours associée au captage 
                </br>
                </br> 
                <span class="captage-title">${nom_ouvrage}</span>
                </br>
                </br>
                <a href="https://www.fredonoccitanie.com/captages/nous-contacter/" class="lien_contact" target="_blanck"> CONTACTEZ-NOUS !</a>
            </div>
        `;
    }

    // Afficher les infos de la démarche lors du clic
    function showDemarcheInfo(feature) {
        openPanel(); // Ouvre le panneau latéral si nécessaire
        afficherOnglet('onglet_demarches'); // ouvrir l'onglet Dméraches du panneau
        fillDemarcheInfo(feature);
    }
    

    // Appliqué à chaque démarche
	function onEachFeature_demarches(feature, layer) {

        //layer._leaflet_id = feature.properties.nom; // on désigne le nom de la commune comme l'identifiant de l'entité
    
        // layer.bindPopup(popup_content(feature,'Commune','commune',true));
    
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: function (e) {
                zoomToFeature(e);
                showDemarcheInfo(feature);
                reinitializeCaptage(); // Réinitialiser les infos de la partie "Captages associé(s)"
                fillAllCaptagesInfo(feature.properties.id_demarche_web); // Complète les infos de la partie "Captages associé(s)"
            }
        });
    };

    /// Style
    function style_demarches (feature) {
        var style;
        // Démarches
        if (feature.properties.type_web === 'autre') {
            style = {
                color:'rgb(000,124,142)',
                weight:2,
                fillColor: 'rgb(000,124,142)',
                fillOpacity: 0.5,
            }
        // AAC ou PAT 
        } else if ((feature.properties.type_web === 'AAC')) {
            style = {
                color:'rgb(87,107,53)',
                weight:2,
                fillColor: 'rgb(87,107,53)',
                fillOpacity: 0.5,
            }
        }
        // Démarche terminées
        // } else {
        //     style = {
        //         color:'rgb(164,165,164)',
        //         weight:2,
        //         fillColor: 'rgb(164,165,164)',
        //         fillOpacity: 0.5,
        //     }
        // }
        return style;
    }

    const demarches = L.geoJSON(null,{
        style: style_demarches,
        onEachFeature: onEachFeature_demarches,
        attribution: 'FREDON Occitanie'
    });
    $.getJSON('data/demarches.geojson', function(data){
        console.log(data);
        demarches.addData(data).addTo(map);
    });

    // --------------------------------------------------------------------------------------------------------------
    ///// AAC (EPSG:4326)
    // Toutes les AAC qui n'ont pas de démarches associées directement

    const aac = L.geoJSON(null,{
        style : {
            color:'rgb(87,107,53)',
            weight:2,
            fillColor: 'rgb(87,107,53)',
            fillOpacity: 0.5
        },
        interactive: false // couche non cliquable
    });
    $.getJSON('data/aac_oc.geojson', function(data){
        aac.addData(data).addTo(map);
    });


    aac.bringToFront();

    // --------------------------------------------------------------------------------------------------------------
    ///// Captages (EPSG:4326)

    // Récupérer le chemin de l'icone
    function getIconPath (type_captage) {
        return (type_captage === 'Sensible') ? 'assets/images/goutte_j.png' : 'assets/images/goutte_b.png';
    }

    // Construction du marqueur de la couche des captages (prioritaire ou sensible)
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

    // Fonction de zoom lors du click sur un captage
    function clickZoom(e) {
        //map.setView(e.target.getLatLng(), 13);
        map.flyTo(e.target.getLatLng(), 10, {
            duration: 0.5,  // Durée du vol en secondes
            maxZoom: 10     // Niveau de zoom maximal
        });
    }

    // Réinitialiser le contenu du fieldset Captages
    function reinitializeCaptage () {
        fieldset_captages.innerHTML = ''; // Réinitialiser le contenu du fieldset
    }

    // Construit les infos d'un captage
    function CaptageInfo(feature) {
        var properties = feature.properties;
        return (`
            <div class="captage-title"> 
                <span class="captage-title-text"> ${properties.nom_ouvrage} </span>
                <span class="toggle-icon"></span>
            </div>
            <div class="captage-details">
                <span class="captage_nom_champ"> Bassin </span>
                <span class="captage_champ_info"> ${properties.bassin} </span>
                <span class="captage_nom_champ"> Code ouvrage </span>
                <span class="captage_champ_info"> ${properties.code_points_prelevements} </span>
                <span class="captage_nom_champ"> Statut </span>
                <span class="captage_champ_info"> ${properties.statut} </span>
                <span class="captage_nom_champ"> Maître d'ouvrage </span>
                <span class="captage_champ_info"> ${properties.maitre_ouvrage} </span>
                <span class="captage_nom_champ"> Origine de la ressource </span>
                <span class="captage_champ_info"> ${properties.origine_ressource} </span>
                <span class="captage_nom_champ"> Type de captage </span>
                <span class="captage_champ_info"> ${properties.type_captage} </span>
                <span class="captage_nom_champ"> Commune d'implantation </span>
                <span class="captage_champ_info"> ${properties.nom_com} (${properties.insee_com}) </span>
                <span class="captage_nom_champ"> Enjeux </span>
                <span class="captage_champ_info"> ${properties.enjeux_pollutions} </span>
                <span class="captage_nom_champ"> Population alimentée par l'ouvrage </span>
                <span class="captage_champ_info"> ${properties.population_alimentee} </span>
                <span class="captage_nom_champ"> Arrêtés de dérogation aux limites de qualité de l'eau du robinet </span>
                <span class="captage_champ_info"> ${properties.arretes_zsce} </span>
                <span class="captage_nom_champ"> Réseau complémentaire de suivi </span>
                <span class="captage_champ_info"> ${properties.reseau_complementaire} </span>
                <span class="captage_nom_champ"> Date de début de suivi </span>
                <span class="captage_champ_info"> ${properties.date_debut_suivi} </span>
                <span class="popup_demarche_titre_champs2"> Rendez-vous sur  </span>
                <span class="captage_champ_info"> <a href="${properties.lien}"  target="_blank"> ${properties.lien}</a> </span>
            </div>
        `);
    }
    
    // Contruit le conteneur des infos d'un captage
    function fillCaptageInfo (feature){
        var captageInfo = document.createElement('div');
        captageInfo.className = 'captage-info';
        captageInfo.innerHTML = CaptageInfo(feature);
        captageInfo.id = feature.properties.id_captage_web; // id du conteneur captage-info est id_captage_web
        fieldset_captages.appendChild(captageInfo);
        captageInfo.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleCaptageDetails(captageInfo);
        });
    }


    // Complète les infos de tous les captages d'une démarche
    function fillAllCaptagesInfo(idDemarcheWeb) {
        // Pour l'ensemble des captages
        captages.eachLayer(function (layer) {
            // Si le captage est associé à la démarche
            if (layer.feature.properties.id_demarche_web === idDemarcheWeb) {
                // On complète les infos du captage
                fillCaptageInfo(layer.feature);
            }
        });
    }

    // Changer le style du captage sélectionné
    function toggleCaptageDetails(element) {
        var allCaptages = document.querySelectorAll('.captage-info');
        allCaptages.forEach(function(captage) {
            if (captage !== element) {
                captage.classList.remove('expanded');
            }
        });
        element.classList.toggle('expanded');
    }

    // Déplie le popup du captage sélectionné
    function openPopupSelectedCaptage(idCaptageWeb){
        var conteneurSelectedCaptage = document.getElementById(idCaptageWeb);
        toggleCaptageDetails(conteneurSelectedCaptage);
    }

    // Lors du clic sur un captage
    function showPopupCaptage(feature){
        var idDemarcheWeb = feature.properties.id_demarche_web;
        var idCaptageWeb = feature.properties.id_captage_web;
        openPanel(); // Ouvre le panneau latéral si nécessaire
        afficherOnglet('onglet_captages'); // ouvrir l'onglet Dméraches du panneau
        reinitializeCaptage(); // Réinitaliser le contenu du fieldset captage
        if (idDemarcheWeb === 'non') {
            // pas de démarche associée, on affiche les infos du captage
            fillCaptageInfo(feature);
            fillNoDemarche(feature.properties.nom_ouvrage);
        } else {
            // une démarche associée, on affiche les infos de tous les capatges de la démarches
            fillAllCaptagesInfo(idDemarcheWeb); // Compléter le contenu du fieldset Captages
            fillDemarcheFromIDWeb(feature.properties.id_demarche_web); // Compléter le contenu du fieldset Démarche
        }
        openPopupSelectedCaptage(idCaptageWeb); // déplie le popup du captage sélectionné
    }

    
    function onEachFeature_captage(feature, layer){
        // layer.bindPopup(popup_content(feature,'Établissement de tourisme et de loisir','camping',false)
        // );
        layer.on({
            mouseover : highlightMarker,
            mouseout : resetHighlightMarker,
            click: function (e) {
                clickZoom(e);
                showPopupCaptage(feature);
            }
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

    // Récupérer les captages liés à la démarche
    function getLinkedCaptages (IdDemarcheWeb) {
        captages.eachLayer (function (layer){
            if (layer.feature.properties.id_demarche_web === IdDemarcheWeb) {
                // layer.setStyle(captageHighlightStyle());
                console.log(layer.feature.properties.id_captage_web);
            } else {
                // layer.setStyle(resetHighlightMarker());
            }
        });
    }

    $.getJSON('data/captages.geojson', function(data){
        captages.addData(data).addTo(map);
        updateGeoJSONLayerVisibility();
    });

    // Mise à jour de la visibilité de la carte lors du zoom / dézoom
    map.on('zoomend', updateGeoJSONLayerVisibility);

    // --------------------------------------------------------------------------------------------------------------

    map.whenReady(chargement_carte); // Une fois la carte chargee, on efface l'icone de chargement

}); // fin JQuery