var app={
    
    // Contiene los datos vamos a usar en las notas. Contine una lista.
	model: {
		 "notas": [{"titulo": "Comprar pan", "contenido": "Oferta en la panaderia de la esquina", "fecha_limite": "01/01/2000"}]
	},
    
    variables: {
        path: null,
        conexion: false,
        firebaseIniciado: false,
        firebaseUpdate: false
    },
    
    firebaseConfig: {
        apiKey: "AIzaSyACjOF3X1DwCjG4RB3xM20haT25wZar3xI",
        authDomain: "miriadaxcursoapps.firebaseapp.com",
        databaseURL: "https://miriadaxcursoapps.firebaseio.com",
        storageBucket: "miriadaxcursoapps.appspot.com",
        messagingSenderId: "785208381899"
    },
    
    inicio: function(){
        //alert('inicio');
        console.log('inicio');
        this.iniciaFastClick();
        if (this.variables.firebaseIniciado == false) {this.iniciaFirebase();}
        this.iniciaBotones();
        this.refrescarLista();
        
        //if (app.checkConnection()) {
        //    document.getElementById("conexion").innerHTML = "Con Conexión";
        //} else {
        //    document.getElementById("conexion").innerHTML = "Sin Conexión";
        //}
            
    },

    iniciaFastClick: function(){
        console.log('iniciaFastClick');
        FastClick.attach(document.body);
    },
    
    iniciaFirebase: function() {
        console.log('iniciaFirebase');
        firebase.initializeApp(this.firebaseConfig);  
        app.variables.firebaseIniciado = true;
    },
    
    iniciaBotones: function(){
        // Inicializar los botones
        var salvar = document.querySelector('#salvar');
        var anadir = document.querySelector('#anadir');
        
        console.log('iniciaBotones');
        
        anadir.addEventListener('click', this.mostrarEditor, false);
        salvar.addEventListener('click', this.salvarNota, false);
    },
    
	inicioLecturaDatos: function(){
        console.log('inicioLecturaDatos');
        
		if (app.variables.firebaseIniciado == false) {this.iniciaFirebase();}

		//if(app.hayWifi()){
        if (app.variables.conexion == true || app.checkConnection()) { 
			app.leerFirebase();
		} else {
			app.leerDatos();
			navigator.notification.alert('Datos de dispositivo.\nNo hay wifi para actualizar fichero desde Firebase :(', null, 'Firebase', 'Aceptar');
		}
	},        
    
    mostrarEditor: function(){
        console.log('mostrarEditor');
        // Cuando se pulsa añadir, muestrar en la pantalla el editor, con el titulo y comentario
        document.getElementById('titulo').value = "";
        document.getElementById('comentario').value = "";
        document.getElementById('note-editor').style.display = "block";
        document.getElementById('titulo').focus();
    },
    
    salvarNota: function(){
        console.log('salvarNota');
        // Cuando queremos salvar una nota
        app.construirNota();
        app.ocultarEditor();
        app.refrescarLista();
        app.grabarDatos(); // Guardar las notas, capa de persistencia, en fichero JSON.
    },  
    
    refrescarLista: function(){
        console.log('refrescarLista');
        var div = document.getElementById('notes-list');
        div.innerHTML = this.anadirNotasALista();
    },   
    
    anadirNotasALista: function(){
        console.log('anadirNotasALista');
        // Obtener la notas y dibujar el modelo de las notas, utilizando anadirNota, creado el codigo HTML.
        var notas = this.model.notas;
        var notasDivs = '';
        var dtFechaActual = new Date();
        var ok = false;
        for (var i in notas) {
            var titulo = notas[i].titulo;
			var descripcion = notas[i].contenido;
			var fecha_limite = notas[i].fecha_limite;
            if (fecha_limite == null || fecha_limite == 'undefined' ) {
                console.log('Fecha Limite: No definida');
                fecha_limite = '';
            }
            console.log('Titulo: ' + titulo);
            console.log('Fecha Limite: ' + Date.parse(fecha_limite));
            console.log('Fecha Actual: ' + dtFechaActual);
            if (fecha_limite == '') {ok = true;}
            if (ok == false && Date.parse(fecha_limite) >= dtFechaActual ) {ok = true;}
            if (ok == true) { 
			 notasDivs = notasDivs + this.anadirNota(i, titulo, descripcion, fecha_limite);     
            }
        }
        return notasDivs;
    },  

    construirNota: function(){
        console.log('construirNota');
        // Construir la nueva nota
        var notas = this.model.notas; // obtenemos del modelo las notas. Model definido arriba
        notas.push({"titulo": app.extraerTitulo(), "contenido": app.extraerComentario(), "fecha_limite": app.extraerFecha()}); // Añadimos un nuevo elemento a la lista model.
    },   
    
    extraerTitulo: function(){
        console.log('extraerTitulo');
        // Extraemos el titulo
        return document.getElementById('titulo').value;
    }, 
    
    extraerComentario: function(){
        console.log('extraerComentario');
        // Extraemos el ocmentario
        return document.getElementById('comentario').value;
    },     
    
	extraerFecha: function() {
		var value = document.getElementById('fecha').value;
		if(value == null || value == ''){
			return '';
		}else{
			var d = new Date(value);
			return d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
		}
	},    
    
    ocultarEditor: function(){
        console.log('ocultarEditor');
        // ocultamos de la pantalla el editor, con el titulo y comentario
        document.getElementById('note-editor').style.display = "none";
    },         
    
    anadirNota: function(id, titulo, comentario, fecha_limite){
        console.log('anadirNota');
        //return "<div class='note-item' id='notas[" + id +  "]'>" + titulo + "</div>";
        
        var nota;
        
        nota = "<div class='note-item' id='notas[" + id +  "]'>" + titulo + "</div>";
        if (fecha_limite != '') {
            nota += '<div>Fecha límite: ' + fecha_limite + '<br>Descripción: '+ comentario + '</div>';
        } else {
             nota += '<div>Descripción: '+ comentario + '</div>';
        }
		//nota += '</div>';
		
		return nota;      
    },  
    
    grabarDatos: function() {
        console.log('grabarDatos');
        //alert('grabarDatos');
        // Solicitar a Cordava nos de un Storage (Donde Guardar)
        if (app.variables.path == null) {
            app.variables.path = app.variableCordovaFile();
        }
        console.log(app.variables.path);
        
        //window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, app.gotFS, app.fail);  
        window.resolveLocalFileSystemURL(app.variables.path, app.gotFS, app.fail);  
    },
    
    gotFS: function(fileSystem) {
        console.log('gotFS  ' + fileSystem.name + ' ' +  fileSystem.fullPath);
        //alert('gotFS');
        console.log(app.variables.path + "files/" + "model.json");
        
        fileSystem.getDirectory("files", {create: true, exclusive: false}, app.gotDirectory, app.fail); 
        //fileSystem.getFile(app.variables.path + "file/"+"model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
    },
    
    gotDirectory: function(directoryEntry) {
        console.log('directoryEntry ' +  directoryEntry.fullPath + ' ' + directoryEntry.name);
        //alert('directoryEntry');
        directoryEntry.getFile("model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);   
    },
    
    gotFileEntry: function(fileEntry) {
        console.log('gotFileEntry ' +  fileEntry.fullPath + ' ' + fileEntry.name);
        //alert('gotFileEntry');
        fileEntry.createWriter(app.gotFileWriter, app.fail);
    },    
    
    gotFileWriter: function(writer) {
        console.log('gotFileWriter ' + writer.localURL);
        //alert('gotFileWriter');
        // Que grabe un version JSON de nuestro fichero.
        writer.onwriteend = function(evt) {
          console.log("datos grabados en directorio " + app.variables.path);
          //if(app.hayWifi()) {
          //if(app.checkConnection()) {
          if (app.variables.conexion == true || app.checkConnection()) { 
            //console.log('hayWifi ' +  ' llamada salvarFirebase');
            console.log('hay Conexion ' +  ' llamada salvarFirebase');
            app.salvarFirebase();
          }
        };
        writer.write(JSON.stringify(app.model));        
    },
    
    salvarFirebase: function() {
        console.log('salvarFirebase');
        var ref = firebase.storage().ref('model.json');
        ref.putString(JSON.stringify(app.model));
    },
    
    hayWifi: function() {
        console.log('hayWifi ' +  navigator.connection.type);
        return navigator.connection.type==='wifi';
    },    
    
    leerDatos: function() {
        console.log('leerDatos');
        //alert('leerDatos'); 
        //app.inicio();
        // Solicitar a Cordava nos de un Storage (Donde Leer)
        if (app.variables.path == null) {
            app.variables.path = app.variableCordovaFile();
        }
        console.log(app.variables.path);
        
        window.resolveLocalFileSystemURL(app.variables.path, app.obtenerFS, app.noExisteFileEntry); 
        //window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
        //app.inicio();
    },
    
    variableCordovaFile: function() {
        console.log('variableCordovaFile');
        if (cordova.file.externalApplicationStorageDirectory != null) {
            console.log('externalApplicationStorageDirectory');
            return cordova.file.externalApplicationStorageDirectory;
        } else if (cordova.file.externalDataDirectory != null) {
            console.log('externalDataDirectory');
            return cordova.file.externalDataDirectory;
        } else if (cordova.file.externalRootDirectory != null) {
            console.log('externalRootDirectory');
            return cordova.file.externalRootDirectory;
        } else if (cordova.file.dataDirectory != null) {
            console.log('dataDirectory');
            return cordova.file.dataDirectory;
        } else if (cordova.file.documentsDirectory != null) {
            console.log('documentsDirectory');
            return cordova.file.documentsDirectory;
        } else if (cordova.file.tempDirectory != null) {
            console.log('tempDirectory');
            return cordova.file.tempDirectory;    
        } else if (cordova.file.applicationStorageDirectory != null) {
            console.log('applicationStorageDirectory');
            return cordova.file.applicationStorageDirectory;            
        } else if (cordova.file.cacheDirectory != null) {
            console.log('cacheDirectory');
            return cordova.file.cacheDirectory;
        } else if (cordova.file.applicationDirectory != null) {
            console.log('applicationDirectory');
            return cordova.file.applicationDirectory;
        } else if (cordova.file.externalCacheDirectory != null) {
            console.log('externalCacheDirectory');
            return cordova.file.externalCacheDirectory;
        } else {
            console.log('file:///');
            return 'file:///';
        }
    },   

    obtenerFS: function(fileSystem) {
        console.log('obtenerFS ' + fileSystem.name + ' ' +  fileSystem.fullPath);
        //alert('obtenerFS');
        console.log(app.variables.path + "files/" + "model.json");
        
        fileSystem.getDirectory("files", {create: true, exclusive: false}, app.obtenerDirectory, app.fail); 
       
        //fileSystem.getFile(app.variables.path + "files/" + "model.json", null, app.obtenerFileEntry, app.noExisteFileEntry);  
        //fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.fail);
    },
    
    noExisteFileEntry: function(error) {
        // No existe el fichero .json
        console.log('noExisteFileEntry');
        //alert('noExisteFileEntry');
        console.log(error.code);     
        app.inicio();
    },
    
    obtenerDirectory: function(directoryEntry) {
        console.log('obtenerDirectory ' +  directoryEntry.fullPath + ' ' + directoryEntry.name);
       //fileSystem.getFile(app.variables.path + "files/" + "model.json", null, app.obtenerFileEntry, app.noExisteFileEntry);   
        directoryEntry.getFile("model.json", null, app.obtenerFileEntry, app.noExisteFileEntry);  
    },
    
    obtenerFileEntry: function(fileEntry) {
        console.log('obtenerFileEntry ' +  fileEntry.fullPath + ' ' + fileEntry.name);
        //alert('obtenerFileEntry');
        fileEntry.file(app.leerFile, app.fail);
    },
    
    leerFile: function(file) {
        console.log('leerFile ' + file.localURL);
        //  alert('leerFile');
        // Leer la nostas almacenadas, a partir de un reader
        // Se lee el JSon
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            var data = evt.target.result;
            if (data == null) {
               // If you receive a null value the file doesn't exists
               console.log('leerFile. fichero no existe.');
               app.inicio();    
            } else {
                // Otherwise the file exists
                console.log('leerFile. fichero existe.');
                app.model = JSON.parse(data); // Se transforma el JSON a nuestro modelo.
                app.inicio();
            }                     
        };
        reader.readAsText(file);            
    },
    
    leerFirebase: function() {
        console.log('leerFirebase');
        var storage = firebase.storage();
        var ref = storage.ref('model.json');
        
        if (ref != null) { 
            console.log('Referencia al Firebase.Storage correcta.');  
            // Get the download URL
            ref.getDownloadURL().then(function(url) {         
                    console.log('URL: ' + url);
                    var xhr = new XMLHttpRequest();
                    if (xhr == null || xhr == 'undefined') {console.log('XMLHttpRequest no valido.');}
                    xhr.responseType = 'json';

                    xhr.onload = function(event){
                        console.log('Leido correctamente.');
                        var status = xhr.status;
                        if(status == 200){
                            var json = xhr.response;
                            app.model = json;
                            app.variables.firebaseUpdate = true;
                            app.grabarDatos();
                            app.inicio();
                            navigator.notification.alert('Datos actualizados desde Firebase :)', null, 'Firebase', 'Aceptar');
                        } else {
                            console.log('XMLHttpRequest: Error al leer los datos del fichero.');
                            app.leerDatos();
                            navigator.notification.alert('Datos de dispositivo.\nHa ocurrido un error al obtener el fichero desde Firebase :(', null, 'Firebase', 'Aceptar');
                        }
                    };

                    xhr.open('GET', url, true);
                    xhr.send();    
                }).catch(function(error) {
                  console.log('Error lectura. ' + error.code);    
                  app.leerDatos();
                  if(error.code == "storage/object-not-found"){
                        console.log('Datos de dispositivo.\nNo hay fichero compartido en Firebase');
                    }else{
                        navigator.notification.alert('Datos de dispositivo.\nHa ocurrido un error al obtener el fichero desde Firebase.', null, 'Firebase', 'Aceptar');
                    }
                });    
            //ref.putString(JSON.stringify(app.model));
        } else {
            console.log('No se ha otenido una referencia al Firebase.Storage.');    
            app.leerDatos();
        }
    },    
    
    checkIfFileExists: function(path) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(path, { create: false }, fileExists, fileDoesNotExist);
        }, getFSFail); //of requestFileSystem
    },
    
    fileExists: function (fileEntry) {
        //alert("File " + fileEntry.fullPath + " exists!");
        console.log("File " + fileEntry.fullPath + " exists!");
    },
    
    fileDoesNotExist: function() {
        //alert("file does not exist");
        console.log("file does not exist");
    },
    
    getFSFail: function(evt) {
        console.log(evt.target.error.code);
    },   
    
    checkConnection: function() {
        var networkState = navigator.connection.type;
        var states = {};
        var statesAbrevia = {};
            
        if (networkState == null || networkState == 'undefined') {
            console.log('Connection type: No network connection');
            //alert('Connection type: No network connection');
            return false;
        }
        
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        
        statesAbrevia[Connection.UNKNOWN]  = '';
        statesAbrevia[Connection.ETHERNET] = 'Eth';
        statesAbrevia[Connection.WIFI]     = 'WiFi';
        statesAbrevia[Connection.CELL_2G]  = '2G';
        statesAbrevia[Connection.CELL_3G]  = '3G';
        statesAbrevia[Connection.CELL_4G]  = '4G';
        statesAbrevia[Connection.CELL]     = 'Cell';
        statesAbrevia[Connection.NONE]     = '';   

        console.log('Connection type: ' + states[networkState]);    
        //alert('Connection type: ' + states[networkState]);
        
        if (networkState == Connection.ETHERNET ||
            networkState == Connection.WIFI ||
            networkState == Connection.CELL_2G ||
            networkState == Connection.CELL_3G ||
            networkState == Connection.CELL_4G ||
            networkState == Connection.CELL) {
            document.getElementById("tipoconexion").innerHTML = statesAbrevia[networkState];
            return true;
        } else {
            document.getElementById("tipoconexion").innerHTML = '';
        }
        
        return false;
    },        
      
    onOnline: function() {
        // Eventos con callback, cuando hay conexion internet   
        console.log('onOnline');
        app.variables.conexion = true;
        document.getElementById("conexion").innerHTML = "Con Conexión";
        app.checkConnection();
    },
    
    onOffline: function() {
        // Eventos con callback, cuando hay sin conexion internet   
        console.log('onOffline');
        app.variables.conexion = false;
        document.getElementById("conexion").innerHTML = "Sin Conexión";
        app.checkConnection();
    },    
    
    fail: function(error) {
        console.log('fail');
        //alert('fail');
        console.log(error.code);  
    } 
};

if('addEventListener' in document){
    document.addEventListener('offline', app.onOffline, false); 
    document.addEventListener('online', app.onOnline, false);             
    document.addEventListener('deviceready',function() {
        //app.checkConnection();
        //app.leerDatos();      
        app.inicioLecturaDatos();
    },false);
}
