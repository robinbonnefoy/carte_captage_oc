$(document).ready(function () {
    // ------------------------------------------------------------------------------------------------------------
    ///// Constantes et variables globales

    const mapContainer = document.getElementById("map"); // conteneur de la carte Leaflet

    const rightPanel = document.getElementById("panel-right"); // panneau latéral de droite
    const rightPanelWidth = "300px";
    const openButtons = document.querySelectorAll('.openbtn-right'); // bouton latéraux de droite (démarche et captages)
    const fieldset_captages = document.getElementById('onglet_captages'); // id du fieldset de l'onglet Captages du panneau latéral de droite
    const fieldset_demarches = document.getElementById('onglet_demarches'); // id du fieldset de l'onglet Démarches du panneau latéral de droite
    var selectedIdDemarcheWeb = null ; // id_demarche_web de la Démarche sélectionnée
    var selectedIdCaptageWeb = null ; // id_captage_web du captage sélectionnée

    const leftPanel = document.getElementById("panel-left");
    const leftPanelWidth = "300px";
    const openLeftButtons = document.querySelectorAll('.openbtn-left'); 
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

    function closePanel (panel,widthPanel,fctToggle) {
        const isOpen = panel.style.width === widthPanel;
        if(isOpen){
            fctToggle();
        }
    }

    /// Carte

    // Ajuster la taille de la carte après une transition
    function adjustMapSize() {
        setTimeout(function() {
            map.invalidateSize();
        }, 600); // Ajuster en fonction de la durée de la transition
    }

    /// Panneau latéral droite

    // Récupère le nom de domaine d'une url
    function extractDomainFromUrl (url) {
        return new URL(url).hostname;
    }

    // Vérifie si le pannneau latéral est ouvert, et l'ouvre si nécessaire
    function openPanel (){
        const isOpen = rightPanel.style.width === rightPanelWidth;
        if (!isOpen) {
            toggleRightPanel();
        } 
    }

    // Fonction pour ouvrir/fermer le panneau
    function toggleRightPanel() {
        if (rightPanel.style.width === '0px' || rightPanel.style.width === '') {
            // Ouvrir le panneau droit
            mapContainer.style.width = "calc(100% - " + rightPanelWidth + ")";
            rightPanel.style.width = rightPanelWidth;
            // Occulter les deux boutons
            openButtons.forEach(button => {
                button.style.display = 'none';
            });
        } else {
            // Fermer le panneau
            rightPanel.style.width = '0';
            mapContainer.style.width = "100%";
            // Afficher les deux boutons
            openButtons.forEach(button => {
                button.style.display = 'block';
            });
            // Réinitialiser les styles des démarches et captages sélectionnés
            resetHighlightSelectedFeature();
            resetHighlightSelectedMarker();
            // Réinitialiser les popups
            defautPopupDemarche();
            defaultPopupCaptage();
        }
        // adjustMapSize();
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
        closePanel(leftPanel, leftPanelWidth, toggleLeftPanel); // Fermer le panneau de gauche si ouvert
        toggleRightPanel();
        afficherOnglet('onglet_demarches');
    });
    document.getElementById('bt_captages').addEventListener("click", () => {
        closePanel(leftPanel, leftPanelWidth, toggleLeftPanel); // Fermer le panneau de gauche si ouvert
        toggleRightPanel();
        afficherOnglet('onglet_captages');
    });

    // Paramétrage du bouton pour fermer le panneau de droite
    document.getElementById('bt_fermer-right').addEventListener("click", () => {
        toggleRightPanel();
    });

    // Paramétrage des bouton Onglets
    document.getElementById('bt_onglet_demarches').addEventListener("click", () => {
        afficherOnglet('onglet_demarches');
    });
    document.getElementById('bt_onglet_captages').addEventListener("click", () => {
        afficherOnglet('onglet_captages');
    });

    // Programme de dépliement et rabbatage de la partie Plus d'information du popup démarches / captages
    function moreInfoAction (idButton, idParentContainer) {
        // Section - Plus d'information
        const moreInfoButton = document.getElementById(idButton);
        const moreInfo = document.getElementById(idParentContainer);
        moreInfoButton.addEventListener('click', function() {
            moreInfo.classList.toggle('open');
        });
    }

    // Vérifie l'URL
    function isValidUrl(string) {
        try {
          new URL(string);
          return `<a href="${properties.lien}"  target="_blank" class="captage_link"> ${extractDomainFromUrl(properties.lien)}</a>`;
        } catch (err) {
          return 'N/A';
        }
    }

    /// Panneau latéral de gauche

    // Fonction pour ouvrir/fermer le panneau gauche
    function toggleLeftPanel() {
        if (leftPanel.style.width === '0px' || leftPanel.style.width === '') {
            // Ouvrir le panneau gauche
            leftPanel.style.width = leftPanelWidth;
            mapContainer.style.width = "calc(100% - " + leftPanelWidth + ")";
            mapContainer.style.marginLeft = leftPanelWidth;
        } else {
            // Fermer le panneau gauche
            leftPanel.style.width = '0';
            mapContainer.style.marginLeft = '0';
            mapContainer.style.width = "100%";
        }
        // adjustMapSize();
    }

    // Paramétrage des deux boutons latéraux
    openLeftButtons.forEach(button => {
        button.addEventListener("click", () => {
            toggleLeftPanel('open');
            closePanel(rightPanel, rightPanelWidth, toggleRightPanel); // Fermer le panneau de droit si ouvert
        });
    });

    // Paramétrage du bouton pour fermer le panneau de droite
    document.getElementById('bt_fermer-left').addEventListener("click", () => {
        toggleLeftPanel();
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

    // Zoom sur l'entité polygonale sélectionnée
	function zoomToFeature(layer) {
        map.fitBounds(layer.getBounds(),{maxZoom : 12});
        map.panBy([-300 / 2, 0], { animate: false }); // Décale la carte vers la gauche pour compenser le paneau latéral
    };

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
        var layer = e.target ;
        var idDemarcheWeb = layer.feature.properties.id_demarche_web ;
        if (idDemarcheWeb === selectedIdDemarcheWeb) {
            // si la démarche est celle qui est sélectionnée, on applique la mise en forme spécifique de la démarche sélectionnée
            highlightSelectedFeature(e.target);
        } else {
            // sinon on réinitialise le style de la démarche
            demarches.resetStyle(layer);
        }
    };

    // Mise en forme de la démarche sélectionnée
    function highlightSelectedFeature(layer) {
        selectedIdDemarcheWeb = layer.feature.properties.id_demarche_web ;
        layer.setStyle({
            weight: 5,
            color: '#F868CB',
            dashArray: '',
            fillColor : '#F868CB',
            // fillOpacity: 0.7
        });
        // Assurez-vous de ramener en avant uniquement sur le clic
        // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        //     layer.bringToFront();
        // }
    }

    // Réinitialise le style de la démarche sélectionnée 
    function resetHighlightSelectedFeature (){
        if (!!selectedIdDemarcheWeb){
        // si une démarche est sélectionnée
            demarches.eachLayer(function (layer) {
                // Si la démarche est sélectionnée
                if (layer.feature.properties.id_demarche_web === selectedIdDemarcheWeb) {
                    demarches.resetStyle(layer);
                }
            });
            selectedIdDemarcheWeb = null; 
        }
    }

    /// Démarches associées

    // Récupère le nom de la démarche associée
    function getNomDemarcheAssociee (idDemarcheWeb){
        var nomDemarche ;
        demarches.eachLayer(function (layer) {
            // Si la démarche est associée au captage
            if (layer.feature.properties.id_demarche_web === idDemarcheWeb) {
                console.log(layer.feature.properties.nom);
                nomDemarche =  layer.feature.properties.nom;
            }
        });
        return nomDemarche;
    }

    // Ouvre la démarche associée
    function openDemarcheAssociee(idDemarcheWeb){
        demarches.eachLayer(function (layer) {
            // Si la démarche est associée au captage
            if (layer.feature.properties.id_demarche_web === idDemarcheWeb) {
                resetHighlightSelectedMarker(); // désélectionne le captage
                resetHighlightSelectedFeature(); // réinitialisation du style d'une démarche sélectionnée
                highlightSelectedFeature(layer); // si on met e fait référence à l'évènement et ne fonctionne pas si on veut mettre une couche sans évènement clic
                zoomToFeature(layer);
                showDemarcheInfo(layer.feature);
                reinitializeCaptage(); // Réinitialiser les infos de la partie "Captages associé(s)"
                fillAllCaptagesInfo(layer.feature.properties.id_demarche_web); // Complète les infos de la partie "Captages associé(s)"
            }
        });
    }

    function demarchesAssocieesPopupClick (str){
        // Si il y a une / des démarches associées
        if (str.substring(0,4) === 'DEM_'){
            // Diviser la chaîne en un tableau en utilisant la virgule comme séparateur
            var ids = str.split(", ");
            // Parcourir chaque ID dans le tableau avec une boucle for
            for (var i = 0; i < ids.length; i++) {
                // Isoler chaque ID
                var id = ids[i];
                var idContainer= 'ASSOC_' + id;
                // Paramétrage des bouton Onglets
                document.getElementById(idContainer).addEventListener("click", () => {
                    openDemarcheAssociee(id);
                });

            }
        }
    }

    // Ajoute une partie dans le popup Démarche sur les démarches associées
    function demarchesAssocieesPopup(str){
        var insert = '';
        // Si il y a une / des démarches associées
        if (str.substring(0,4) === 'DEM_'){
            insert += `<span class="popup_demarche_titre_champs2"> Démarche(s) associée(s)  </span>`;
            // Diviser la chaîne en un tableau en utilisant la virgule comme séparateur
            var ids = str.split(", ");
            // Parcourir chaque ID dans le tableau avec une boucle for
            for (var i = 0; i < ids.length; i++) {
                // Isoler chaque ID
                var id = ids[i];
                insert += `
                    <span class="demarche_associee" id="ASSOC_${id}"> ${getNomDemarcheAssociee(id)} </span>
                `;
            }
        }
        return insert;
    }

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
            <div class="more_info" id="more_info2">
                <div class="more_info_button" id="more_info_button2">Aller plus loin</div>
                <div class="more_info_content">
                    <span class="popup_demarche_titre_champs2"> Rendez-vous sur  </span>
                    <span class="popup_info2"> ${isValidUrl(feature.properties.lien)} </span>
                    ${demarchesAssocieesPopup(feature.properties.id_demarche_web_associe)}
                </div>
            </div>
        `;
        // Paramétrage du popup (sections rabatues)
        moreInfoAction('more_info_button','more_info');
        moreInfoAction('more_info_button2','more_info2');
        // Paramétrage bouton démarche associée
        demarchesAssocieesPopupClick(feature.properties.id_demarche_web_associe);
    }

    // Remplir la démarche à partir de l'id_demarche_web
    function fillDemarcheFromIDWeb (idDemarcheWeb){
        demarches.eachLayer(function (layer) {
            // Si la démarche est associée au captage
            if (layer.feature.properties.id_demarche_web === idDemarcheWeb) {
                // On complète les infos du captage
                fillDemarcheInfo(layer.feature);
                // On met sélectionne la démarche correspondante
                highlightSelectedFeature(layer);
            }
        });
    }

    // Remplir l'onglet démarche quand pas de démarches associées au captage
    function fillNoDemarche () {
        fieldset_demarches.innerHTML = `
            <div class="no_demarche"> 
                Si vous avez connaissance d'une démarche en cours associée au captage 
                </br>
                </br>
                <a href="https://www.fredonoccitanie.com/captages/nous-contacter/" class="lien_contact" target="_blanck"> CONTACTEZ-NOUS !</a>
            </div>
        `;
    }
        
    // Réinitialiser le contenu du fieldset Démarche
    function defautPopupDemarche() {
        fieldset_demarches.innerHTML = `
            <div class="no_demarche"> 
                Aucune démarche sélectionnée
            </div>
        `;
    }

    // Afficher les infos de la démarche lors du clic
    function showDemarcheInfo(feature) {
        closePanel(leftPanel, leftPanelWidth, toggleLeftPanel); // Fermer le panneau de gauche si ouvert
        openPanel(); // Ouvre le panneau latéral si nécessaire
        afficherOnglet('onglet_demarches'); // ouvrir l'onglet Dméraches du panneau
        fillDemarcheInfo(feature);
    }

    // Au clic sur une démarche
    function handleDemarcheClick(layer){
        resetHighlightSelectedMarker(); // désélectionne le captage
        resetHighlightSelectedFeature(); // réinitialisation du style d'une démarche sélectionnée
        highlightSelectedFeature(layer); // si on met e fait référence à l'évènement et ne fonctionne pas si on veut mettre une couche sans évènement clic
        zoomToFeature(layer);
        showDemarcheInfo(layer.feature);
        reinitializeCaptage(); // Réinitialiser les infos de la partie "Captages associé(s)"
        fillAllCaptagesInfo(layer.feature.properties.id_demarche_web); // Complète les infos de la partie "Captages associé(s)"
    }
    
    // Appliqué à chaque démarche
	function onEachFeature_demarches(feature, layer) {

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: function (e) {
                handleDemarcheClick(e.target); // si on met e fait référence à l'évènement et ne fonctionne pas si on veut mettre une couche sans évènement clic
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
        demarches.addData(data).addTo(map);
    });

    // --------------------------------------------------------------------------------------------------------------
    ///// AAC (EPSG:4326)
    // Toutes les AAC qui n'ont pas de démarches associées directement

    // const aac = L.geoJSON(null,{
    //     style : {
    //         color:'rgb(87,107,53)',
    //         weight:2,
    //         fillColor: 'rgb(87,107,53)',
    //         fillOpacity: 0.5
    //     },
    //     interactive: false // couche non cliquable
    // });
    // $.getJSON('data/aac_oc.geojson', function(data){
    //     aac.addData(data).addTo(map);
    // });


    // aac.bringToFront();

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

    // Marker du capatge par défault
    function defaultMarker (layer) {
        var marker = layer;
        const icon = new L.Icon({
            iconUrl: getIconPath(marker.feature.properties.type_captage),
            iconSize: [15, 15],
            // iconAnchor: [0, 0],
            popupAnchor: [0, 0]
        });
        marker.setIcon(icon);
    }

    // Survol captage
    function highlightMarker(marker) {
        const icon = new L.Icon({
            iconUrl: getIconPath(marker.feature.properties.type_captage),
		    iconSize: [30, 30],
            iconAnchor: [15, 15], // permet de garder l'icone centré
            popupAnchor: [0, 0]
         });
        marker.setIcon(icon);
    }

    function resetHighlightMarker(e) {
        var idCaptageWeb =  e.target.feature.properties.id_captage_web;
        if (idCaptageWeb === selectedIdCaptageWeb) {
        // si c'est le captage sélectionné
            highlightSelectedMarker(e.target);
        } else {
            defaultMarker(e.target);
        }
    }

    // Réinitialise le style de l'entité sélectionnée 
    function resetHighlightSelectedMarker (){
        if (!!selectedIdCaptageWeb){
        // si une démarche est sélectionnée
            captages.eachLayer(function (layer) {
                // Si le captage est sélectionné
                // console.log(layer.feature.properties.id_captage_web);
                if (layer.feature.properties.id_captage_web === selectedIdCaptageWeb) {
                    defaultMarker(layer); // style par défaut
                    
                }
            });
            selectedIdCaptageWeb = null; 
        }
    }

    // Mise en forme du captage sélectionné
    function highlightSelectedMarker(marker) {
        const icon = new L.Icon({
            iconUrl: 'assets/images/goutte_r.png',
		    iconSize: [30, 30],
            iconAnchor: [15, 15], // permet de garder l'icone centré
            popupAnchor: [0, 0]
         });
        marker.setIcon(icon);
        selectedIdCaptageWeb = marker.feature.properties.id_captage_web;
    }

    // Fonction de zoom lors du click sur un captage
    function clickZoom(marker) {
        //map.setView(e.target.getLatLng(), 13);
        map.flyTo(marker.getLatLng(), 10, {
            duration: 0.5,  // Durée du vol en secondes
            maxZoom: 10     // Niveau de zoom maximal
        });
    }

    // Réinitialiser le contenu du fieldset Captages
    function reinitializeCaptage () {
        fieldset_captages.innerHTML = '';
    }

    // Réinitialiser le contenu du fieldset Captages
    function defaultPopupCaptage () {
        fieldset_captages.innerHTML = `
            <div class="no_demarche"> 
                Aucun captage sélectionné
            </div>`
        ;
    }

    // Construit les infos d'un captage
    function CaptageInfo(feature) {
        var properties = feature.properties;
        return (`
            <div class="captage-title" id="captage_title_${properties.id_captage_web}"> 
                <span class="captage-title-text"> ${properties.nom} </span>
                <span class="toggle-icon"></span>
            </div>
            <div class="captage-details">
                <span class="captage_nom_champ"> Statut </span>
                <span class="captage_champ_info"> ${properties.statut} </span>
                <span class="captage_nom_champ"> Maître d'ouvrage </span>
                <span class="captage_champ_info"> ${properties.maitre_ouvrage} </span>
                <span class="captage_nom_champ"> Origine de la ressource </span>
                <span class="captage_champ_info"> ${properties.origine_ressource} </span>
                <span class="captage_nom_champ"> Type de captage </span>
                <span class="captage_champ_info"> ${properties.type_captage} </span>
                <span class="captage_nom_champ"> Bassin </span>
                <span class="captage_champ_info"> ${properties.bassin} </span>
                <span class="captage_nom_champ"> Commune d'implantation </span>
                <span class="captage_champ_info"> ${properties.nom_com} (${properties.insee_com}) </span>
                <div class="captage_more_info" id="captage_more_info_${properties.id_captage_web}">
                    <div class="captage_more_info_button" id="captage_more_info_button_${properties.id_captage_web}">
                        Plus d'informations
                    </div>
                    <div class="captage_more_info_content">
                        <span class="captage_more_info_champ"> Codes des points de prélèvements associés (BSS) </span>
                        <span class="captage_champ_info"> ${properties.code_points_prelevements} </span>
                        <span class="captage_more_info_champ"> Population alimentée par l'ouvrage </span>
                        <span class="captage_champ_info"> ${properties.population_alimentee} </span>
                        <span class="captage_more_info_champ"> Enjeux </span>
                        <span class="captage_champ_info"> ${properties.enjeux_pollutions} </span>
                        <span class="captage_more_info_champ"> Réseau complémentaire de suivi </span>
                        <span class="captage_champ_info"> ${properties.reseau_complementaire} </span>
                        <span class="captage_more_info_champ"> Date de début de suivi </span>
                        <span class="captage_champ_info"> ${properties.date_debut_suivi} </span>
                        <span class="captage_more_info_champ"> Arrêté de dérogation aux limites de qualité de l'eau du robinet </span>
                        <span class="captage_champ_info"> ${properties.arretes_zsce} </span>
                        <span class="captage_more_info_champ" style="color:#e17a0c;"> Rendez-vous sur  </span>
                        <span class="captage_champ_info"> ${isValidUrl(properties.lien)} </span>
                    </div>
                </div>
            </div>
        `);
    }
    
    // Contruit le conteneur des infos d'un captage
    function fillCaptageInfo (feature){
        var idCaptageWeb = feature.properties.id_captage_web;
        var captageInfo = document.createElement('div');
        captageInfo.className = 'captage-info';
        captageInfo.innerHTML = CaptageInfo(feature);
        captageInfo.id = idCaptageWeb ; // id du conteneur captage-info est id_captage_web
        fieldset_captages.appendChild(captageInfo);
        // Dépliement des infos du captage
        document.getElementById('captage_title_' + idCaptageWeb).addEventListener('click', function(event) {
            event.stopPropagation();
            toggleCaptageDetails(captageInfo);
        });
        // Dépliement de la partie plus d'informations
        moreInfoAction ('captage_more_info_button_'+ idCaptageWeb, 'captage_more_info_'+ idCaptageWeb) 
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

    // Selectionne et met en forme le captage à partir de son id_captage_web
    function selectCaptagesFromIdCaptageWeb (idCaptageWeb) {
        // Pour l'ensemble des captages
        captages.eachLayer(function (layer) {
            if (layer.feature.properties.id_captage_web === idCaptageWeb) {
                // On sélectionne le captage
                highlightSelectedMarker(layer);
                clickZoom(layer);
            }
        });
    }

    // Changer le style du captage sélectionné
    function toggleCaptageDetails(element) {
        // partie popup
        var allCaptages = document.querySelectorAll('.captage-info');
        allCaptages.forEach(function(captage) {
            if (captage !== element) {
                captage.classList.remove('expanded');
            }
        });
        element.classList.toggle('expanded'); // on déplie la partie du captage sélectionné
        // partie visuelle
        resetHighlightSelectedMarker();
        selectCaptagesFromIdCaptageWeb(element.id);
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
        closePanel(leftPanel, leftPanelWidth, toggleLeftPanel); // Fermer le panneau de gauche si ouvert
        openPanel(); // Ouvre le panneau latéral si nécessaire
        afficherOnglet('onglet_captages'); // ouvrir l'onglet Dméraches du panneau
        reinitializeCaptage(); // Réinitaliser le contenu du fieldset captage
        if (idDemarcheWeb === 'non') {
            // pas de démarche associée, on affiche les infos du captage
            fillCaptageInfo(feature);
            fillNoDemarche();
        } else {
            // une démarche associée, on affiche les infos de tous les capatges de la démarches
            fillAllCaptagesInfo(idDemarcheWeb); // Compléter le contenu du fieldset Captages
            fillDemarcheFromIDWeb(feature.properties.id_demarche_web); // Compléter le contenu du fieldset Démarche
        }
        openPopupSelectedCaptage(idCaptageWeb); // déplie le popup du captage sélectionné
    }

    // Au clic sur un captage
    function handleCaptageClick (layer) {
        clickZoom(layer);
        resetHighlightSelectedFeature(); // désélectionne la démarche
        resetHighlightSelectedMarker(); // désélectionne le captage
        showPopupCaptage(layer.feature);
        highlightSelectedMarker(layer); // sélectionne le captage
    }
    
    function onEachFeature_captage(feature, layer){
        // layer.bindPopup(popup_content(feature,'Établissement de tourisme et de loisir','camping',false)
        // );
        layer.on({
            mouseover : function(e) {
                highlightMarker(e.target);
            },
            mouseout : resetHighlightMarker,
            click: function (e) {
                handleCaptageClick(e.target);
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
    ///// BARRE DE RECHERCHE

    document.getElementById('searchInput').addEventListener('input', function() {
        var query = this.value.toLowerCase();
        var resultsDiv = document.getElementById('results');

        var results = [];

        // Réinitialiser les suggestions si le champ est vide
        if (query === '') {
            resultsDiv.innerHTML = ''; // Efface les suggestions
            return;
        }
    
        // Fonction pour rechercher dans une couche GeoJSON
        function searchInLayer(layer, layerType) {
            layer.eachLayer(function(featureLayer) {
                var properties = featureLayer.feature.properties;
                for (var key in properties) {
                    if (properties[key].toString().toLowerCase().indexOf(query) !== -1) {
                        results.push({
                            layer: featureLayer,
                            type: layerType
                        });
                        break;
                    }
                }
            });
        }
        
        // Recherche dans les deux couches avec indication du type
        searchInLayer(demarches, 'demarche');
        searchInLayer(captages, 'captage');

        // Trier les résultats par ordre alphabétique en fonction du champ 'nom'
        results.sort(function(a, b) {
            return a.layer.feature.properties.nom.toLowerCase().localeCompare(b.layer.feature.properties.nom.toLowerCase());
        });
            
        // Limiter le nombre de résultats à 10
        results = results.slice(0, 10);
    
        // Afficher les résultats
        resultsDiv.innerHTML = '';
    
        results.forEach(function(result) {
            var listItem = document.createElement('div');
            listItem.innerHTML = result.layer.feature.properties.nom;  // Modifier en fonction de ce que vous voulez afficher
            listItem.style.cursor = 'pointer';
            
            // Appliquer une fonction différente selon le type
            listItem.addEventListener('click', function() {
                if (result.type === 'demarche') {
                    handleDemarcheClick(result.layer);
                } else if (result.type === 'captage') {
                    handleCaptageClick(result.layer);
                }
            });
            resultsDiv.appendChild(listItem);
        });

        console.log(results);
    });

    // Fonction pour gérer le clic sur la croix
    document.getElementById('clearSearch').addEventListener('click', function() {
        var searchInput = document.getElementById('searchInput');
        searchInput.value = ''; // Vide le champ de recherche
        document.getElementById('results').innerHTML = ''; // Efface les suggestions
        searchInput.focus(); // Redonne le focus au champ de recherche
    });
    
   

    // --------------------------------------------------------------------------------------------------------------

    map.whenReady(chargement_carte); // Une fois la carte chargee, on efface l'icone de chargement

}); // fin JQuery