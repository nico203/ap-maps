angular.module('ap-maps').directive('apMapPolyline', [
    'mapService','$rootScope',
    function(mapService,$rootScope) {
        return {
            restrict: 'AE',
            scope: {
                name: '@'
            },
            link: function(scope, elem, attr) {
                //elemento del DOM en donde se va a poner el mapa
                var elemMap = elem.find('.map');
                
                //seteamos el alto del mapa 
                scope.height = mapService.height;
                
                //instancia de leaflet del mapa
                var map = null;
                
                //arreglo de marcadores
                var markers = [];
                
                //instancia de polyline leaflet
                var polyline = null;
                
                //inicializamos el mapa
                mapService.init(elemMap[0]).then(function(m) {
                    map = m;
                    
                    //agregamos el evento click sobre el mapa
                    map.on('click', onCLickMap);
                });
                
                //evento al hacer click sobre el mapa.
                function onCLickMap(e) {
                    //prevenimos que no haya 
                    if(map === null) return;
                    var latLng = e.latlng;
                    
                    //agregamos un marcador sobre el mapa
                    var marker = L.marker(latLng);
                    marker.addTo(map);
                    marker.on('click',onClickMarker); 
                    //agregamos el marcador a la lista de marcadores
                    markers.push(marker);
                    
                    //si la polilinea no existe se la crea, caso contrario se agrega el objeto LatLng 
                    if(polyline === null) {
                        polyline = L.polyline([latLng], {color: 'red'}).addTo(map);
                    } else {
                        polyline.addLatLng(latLng);
                    }
                }
                
                
                function onClickMarker(e) {
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = polyline.getLatLngs();
                    
                    //removemos la posicion del arreglo de posiciones
                    for(var i = 0; i < latLngs.length; i++) {
                        if(latLngs[i].equals(e.latlng)) {
                            latLngs.splice(i, 1);
                            break;
                        }
                    }
                    
                    //borramos el marcador
                    this.remove();
                    
                    //borramos la polilinea
                    polyline.remove();
                    
                    //creamos de nuevo la polilinea
                    polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                }
                
                function clearMap() {
                    console.log(markers);
                    //removemos todos lo marcadores
                    for(var i = 0; i < markers.length; i++) {
                        markers[i].off('click',onClickMarker); 
                        markers[i].remove();
                    }
                    //limpiamos el arreglo
                    markers = [];
                    
                    //removemos la polilinea
                    if(polyline !== null) {
                        polyline.remove();
                        polyline = null; 
                    }
                }
                
                /**
                 * Se tiene en cuenta el type de la directiva para ver si se envia un poligono o una polilinea.
                 * Si es un poligono, cuando se apreta el boton terminar se cierra el poligono
                 */
                scope.finish = function() {
                    if(polyline === null) return;
                    
                    //obtenemos el arreglo de longitudes y latitudes
                    var latLngs = polyline.getLatLngs();
                    
                    //borramos todo
                    clearMap();
                    
                    //creamos el poligono si el type es polygon, sino creamos una polilinea.
                    polyline = L.polyline(latLngs, {color: 'red'}).addTo(map);
                    
                    //emitimos el evento
                    $rootScope.$broadcast('ap-map:polylinepicker', scope.name, latLngs);
                };
                
                scope.clear = clearMap;
                
                var destroyshowOnMapPolyline = scope.$on('apMap:showOnMapPolyline', function(event, name, latLngs) {
                    if(scope.name !== name || latLngs === null) return;
                    
                    //borramos todo
                    clearMap();
                    
                    //mostramos la polilinea segun los latLngs que tengamos
                    polyline = L.polyline(latLngs.latLngs, {color: 'red'}).addTo(map);
                });
                
                
                //destruimos los eventos
                var destroyEvent = scope.$on('$destroy', function() {
                    if(map !== null) {
                        map.off('click', onCLickMap);
                    }
                    
                    destroyshowOnMapPolyline();
                    destroyEvent();
                });
            },
            templateUrl: 'directives/mapPolyline/mapPolyline.template.html'
        };
    }
]);
