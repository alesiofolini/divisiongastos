var app = angular.module("app", []);

app.controller("mainController", function($scope) {
	
	$('#divPageContent').hide();
	$('#divAmigosTable').hide();
	
	//Firebase
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDhq6jpnCMhjHZ0u5g3sSv_UgHGzF5EnVI",
		authDomain: "divisiongastos.firebaseapp.com",
		databaseURL: "https://divisiongastos.firebaseio.com",
		storageBucket: "divisiongastos.appspot.com",
		messagingSenderId: "321971605749"
	};
	firebase.initializeApp(config);
	
	//Facebook init
	FB.init({
		appId      : '644133322414568',
		xfbml      : true,
		version    : 'v2.8'
	});
	
	// Observe the change in Facebook login status
    // [START facebookauthlistener]
    FB.Event.subscribe('auth.authResponseChange', checkLoginState);
    // [END facebookauthlistener]
	
	/**
     * Function called when there is a change in Facebook auth state.
     */
    // [START facebookcallback]
    function checkLoginState(event) {
      if (event.authResponse) {
        // User is signed-in Facebook.
        var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
          unsubscribe();
          // Check if we are already signed-in Firebase with the correct user.
          if (!isUserEqual(event.authResponse, firebaseUser)) {
            // Build Firebase credential with the Facebook auth token.
            // [START facebookcredential]
            var credential = firebase.auth.FacebookAuthProvider.credential(
                event.authResponse.accessToken);
            // [END facebookcredential]
            // Sign in with the credential from the Facebook user.
            // [START authwithcred]
            firebase.auth().signInWithCredential(credential).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // [START_EXCLUDE]
              if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
              } else {
                console.error(error);
              }
              // [END_EXCLUDE]
            });
            // [END authwithcred]
          } else {
            // User is already signed-in Firebase with the correct user.
          }
        });
      } else {
        // User is signed-out of Facebook.
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
      }
    }
    // [END facebookcallback]
	
	/**
     * Check that the given Facebook user is equals to the  given Firebase user
     */
    // [START checksameuser]
    function isUserEqual(facebookAuthResponse, firebaseUser) {
      if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
          if (providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
              providerData[i].uid === facebookAuthResponse.userID) {
            // We don't need to re-auth the Firebase connection.
            return true;
          }
        }
      }
      return false;
    }
    // [END checksameuser]
	
	/**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     */
    function initApp() {
      // Listening for auth state changes.
      // [START authstatelistener]
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
			console.log("conectado");
			// User is signed in.
			$scope.currentUser = user;
			console.log('Successful login for: ' + user.displayName);
			document.getElementById('userImg').src = user.photoURL;
			document.getElementById('userName').innerHTML = user.displayName;
			$("#divLogin").hide();
			$("#divAmigos").show();
			$( ".userView" ).show();
			$( "#btnLogin" ).hide();
			$( "#btnLogout" ).show();
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var isAnonymous = user.isAnonymous;
			var userId = user.providerData[0].uid;
			var providerData = user.providerData;
			firebase.database().ref('usuarios/' + userId + '/nombre').set(displayName);
			firebase.database().ref('usuarios/' + userId + '/amigos').on('child_added', function(dataSnapshot){
				var queonda = dataSnapshot.val();
				var amigo = new Object();
				amigo.key = dataSnapshot.key;
				amigo.nombre = dataSnapshot.val();
				var n = $scope.amigos.indexOf(amigo);
				if(n == -1){
					$scope.amigos.push(amigo);
				}
			});
			firebase.database().ref('usuarios/' + userId + '/amigos').on('child_removed', function(dataSnapshot){
				firebase.database().ref('usuarios/' + userId + '/amigos/' + dataSnapshot.key).on('value', function(dataSnapshot2){
					var n;
					for(var i=0; i < $scope.amigos.length; i++){
						if($scope.amigos[i].key == dataSnapshot2.key){
							n = i;
						}
					}
					$scope.amigos.splice(n,1);
				});
			});
			// [START_EXCLUDE]
			//document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
			//document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
			// [END_EXCLUDE]
        } else {
			console.log("no conectado");
			$("#divLogin").show();
			$("#divAmigos").hide();
			$( ".userView" ).hide();
			$( "#btnLogin" ).show();
			$( "#btnLogout" ).hide();
			// User is signed out.
			// [START_EXCLUDE]
			//document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
			//document.getElementById('quickstart-account-details').textContent = 'null';
			// [END_EXCLUDE]
        }
      });
      // [END authstatelistener]
    }
    initApp();
	
	$scope.fbLogin = function() {
		FB.login(function(response) {
			setTimeout(function(){document.location.reload();}, 1500);
		}, {scope: 'public_profile,email,user_friends'});
	}
	
	$scope.fbLogout = function(){
		firebase.auth().signOut();
		document.location.reload();
	}
	
    //Init Materialize elements and fastclick
	$(document).ready(function(){
		$('select').material_select();
		$('.modal-trigger').leanModal();
		window.scrollTo(0,1);
		$('.collapsible').collapsible({
			accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
			,active: true
		});
		$(function() {
			FastClick.attach(document.body);
		});
		$('.button-collapse').sideNav({
				menuWidth: 300, // Default is 240
				edge: 'right', // Choose the horizontal origin
				closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
		});
		$('#cosa').autocomplete({
			data: {
				"comida": null,
				"bebida": null,
				"coca": null,
				"cerveza": null,
				"vino": null,
				"picada": null,
				"gaseosa": null,
				"jugo": null,
				"salame": null,
				"queso": null,
				"mortadela": null,
				"pan": null,
				"hielo": null,
				"fernet": null,
				"ron": null,
				"postre": null,
				"torta": null
			}
		});
	});
	
	//App code
	$("#persona").focus(function() {
		$('html, body').animate({
			scrollTop: $("body").offset().top
		}, 500);
	});
	$("#selectPersonas").focus(function() {
		$('html, body').animate({
			scrollTop: $("body").offset().top
		}, 500);
	});
	$("#cosa").focus(function() {
		$('html, body').animate({
			scrollTop: $("#cosa").offset().top
		}, 500);
	});
	$("#gasto").focus(function() {
		$('html, body').animate({
			scrollTop: $("#gasto").offset().top
		}, 500);
	});
	$("#buscar").focus(function() {
		$('html, body').animate({
			scrollTop: $("#buscar").offset().top
		}, 500);
	});
	
	$scope.personas = [];
	$scope.amigos = [];
	$scope.gastos = [];
	$scope.currentUser;
	$scope.personaValido = true;
	$scope.cosaValido = true;
	$scope.costoValido = true;
	$scope.selectValido = true;
	$scope.errorMessage = '';
	$scope.total = 0;
	$scope.selectedPersona = ''
	$scope.cosa = ''
	$scope.costo = ''
	$scope.modo = 'personas';
	$scope.inputPersona = document.getElementById("persona");
	$scope.inputCosa = document.getElementById("cosa");
	$scope.inputCosto = document.getElementById("gasto");
	$scope.inputSelect = document.getElementById("selectPersonas");
	
	$scope.agregarPersona = function(){
		$scope.personaValido = true;
		$scope.errorPersona = '';
		$scope.validarPersona();
		if($scope.personaValido){
			var persona = new Object();
			persona.nombre = capitalizeFirstLetter($('#persona').val());
			persona.gasto = 0;
			persona.consumo = 0;
			persona.saldo = 0;
			$scope.personas.push(persona);
			$('#persona').val('');
			for(var i = 0; i < $scope.gastos.length; i++){
				$scope.gastos[i].quienesConsumieron.push(persona);
			}
			$scope.agregarAmigo(persona.nombre)
			// Materialize.toast(message, displayLength, className, completeCallback);
			Materialize.toast('<i class="material-icons">done</i><strong>Agregaste a '+ persona.nombre +'</strong>', 2000, 'success')
		}
		$scope.inputPersona.focus();
	}
	
	$scope.validarPersona = function(){
		if($('#persona').val() == ''){
			$scope.errorPersona = "Ingresá un nombre";
			$scope.personaValido = false;
			$("#persona").addClass("invalid");
		}
		for(var i = 0; i < $scope.personas.length; i++){
			if($('#persona').val().toUpperCase() == $scope.personas[i].nombre.toUpperCase()){
				$scope.errorPersona += "Ya agregaste a "+ $scope.personas[i].nombre;
				$('#persona').val('')
				$scope.personaValido = false;
				$("#persona").addClass("invalid");
			}
		}
	}
	
	$scope.amigoAPersonas = function(nombre){
		if($scope.validarAmigoAPersona(nombre)){
			var persona = new Object();
			persona.nombre = capitalizeFirstLetter(nombre);
			persona.gasto = 0;
			persona.consumo = 0;
			persona.saldo = 0;
			$scope.personas.push(persona);
			for(var i = 0; i < $scope.gastos.length; i++){
				$scope.gastos[i].quienesConsumieron.push(persona);
			}
			// Materialize.toast(message, displayLength, className, completeCallback);
			Materialize.toast('<i class="material-icons">done</i><strong>Agregaste a '+ persona.nombre +'</strong>', 2000, 'success')
		}
	}
	
	$scope.validarAmigoAPersona = function(nombre){
		for(var i = 0; i < $scope.personas.length; i++){
			if(nombre.toUpperCase() == $scope.personas[i].nombre.toUpperCase()){
				Materialize.toast('<i class="material-icons">error_outline</i><strong>Ya agregaste a '+nombre+'</strong>', 2000, 'error')
				return false;
			}
		}
		return true;
	}
	
	$scope.deletePersona = function(p){
		for(var i = 0; i < $scope.gastos.length; i++){
			var consumoIndex = $scope.gastos[i].quienesConsumieron.indexOf(p);
			if(consumoIndex != -1){
				$scope.gastos[i].quienesConsumieron.splice(consumoIndex, 1);
			}
		}
		var index = $scope.personas.indexOf(p);
		$scope.personas.splice(index, 1);
		$scope.updateSaldos();
	}
	
	$scope.agregarAmigo = function(nombre){
		var userId = $scope.currentUser.providerData[0].uid;
		var yaesamigo = false;
		for(var i=0; i < $scope.amigos.length; i++){
			if($scope.amigos[i].nombre == nombre){
				yaesamigo = true;
			}
		}
		if(!yaesamigo){
			firebase.database().ref('usuarios/' + userId + '/amigos').push(nombre);
		}
	}
	
	$scope.deleteAmigo = function(amigo){
		var userId = $scope.currentUser.providerData[0].uid;
		var amigoRef = firebase.database().ref('usuarios/' + userId + '/amigos/' + amigo.key);
		amigoRef.remove()
			.then(function() {
				console.log("Remove succeeded.")
			})
			.catch(function(error) {
				console.log("Remove failed: " + error.message)
			});
	}
	
	$scope.agregarGasto = function(){
		$scope.cosaValido = true;
		$scope.errorCosa = '';
		$scope.costoValido = true;
		$scope.errorCosto = '';
		$scope.selectValido = true;
		$scope.errorSelect = '';
		$scope.validarGasto();
		if($scope.cosaValido && $scope.costoValido && $scope.selectValido){
			var gasto = new Object();
			var cosa = new Object();
			gasto.persona = $scope.selectedPersona;
			cosa.nombre = capitalizeFirstLetter($('#cosa').val());
			cosa.costo = parseFloat(parseFloat($scope.costo).toFixed(2));
			$scope.total += parseFloat(parseFloat($scope.costo).toFixed(2));
			gasto.cosa = cosa;
			gasto.quienesConsumieron = [];
			gasto.porPersona = 0;
			$scope.defaultConsumenTodos(gasto);
			$scope.gastos.push(gasto);
			$scope.updateSaldos();
			$scope.selectedPersona = '';
			$scope.cosa = '';
			$scope.costo = '';
			$scope.inputSelect.focus();
			// Materialize.toast(message, displayLength, className, completeCallback);
			Materialize.toast('<i class="material-icons">done</i><strong>Gasto agregado: '+ cosa.nombre +'</strong>', 2000, 'success')
			if($scope.gastos.length == 1){
				// Materialize.toast(message, displayLength, className, completeCallback);
				Materialize.toast('<i class="material-icons">info</i><strong>Seleccioná quienes consumieron cada cosa</strong>', 3000, 'info')
			}
			setTimeout(function(){ $(".collapsible-header").addClass("active"); $(".collapsible").collapsible({accordion: false}); }, 0);
		}
	}
	
	$scope.defaultConsumenTodos = function(gasto){
		for(var i = 0; i < $scope.personas.length; i++){
			gasto.quienesConsumieron.push($scope.personas[i]);
		}
	}
	
	$scope.validarGasto = function(){
		if ($scope.selectedPersona == ''){
			$scope.errorSelect = "Ingresá quién compró";
			$scope.selectValido = false;
			$scope.inputSelect.focus();
			$("#selectPersonas").addClass("errorSelect");
			return;
		}
		else if($scope.cosa == ''){
			$scope.errorCosa = "Ingresá qué compraron";
			$scope.cosaValido = false;
			$scope.inputCosa.focus();
			$("#cosa").addClass("invalid");
			return;
			}
		else{
			for(var i = 0; i < $scope.gastos.length; i++){
				if($scope.cosa.toUpperCase() == $scope.gastos[i].cosa.nombre.toUpperCase()){
					$scope.errorCosa = "Ya ingresaste esta compra";
					$scope.cosa = ''
					$scope.cosaValido = false;
					$scope.inputCosa.focus();
					$("#cosa").addClass("invalid");
					return;
				}
			}
		}
		if($scope.costo == ''){
			$scope.errorCosto = "Ingresá cuánto costó";
			$scope.costoValido = false;
			$scope.inputCosto.focus();
			$("#gasto").addClass("invalid");
			return;
		}
		else if(isNaN($scope.costo)){
			$scope.errorCosto = "El costo debe ser un número";
			$scope.costoValido = false;
			$scope.costo = '';
			$scope.inputCosto.focus();
			$("#gasto").addClass("invalid");
			return;
		}
		else if(!($scope.costo > 0)){
			$scope.errorCosto = "El costo debe ser mayor a cero";
			$scope.costoValido = false;
			$scope.costo = -$scope.costo;
			$scope.inputCosto.focus();
			$("#gasto").addClass("invalid");
			return;
		}
		$("#selectPersonas").removeClass("errorSelect");
	}
	
	$scope.deleteGasto = function(g){
		var index = $scope.gastos.indexOf(g);
		$scope.total -= parseFloat(parseFloat($scope.gastos[index].cosa.costo).toFixed(2));
		$scope.gastos.splice(index, 1);
		$scope.updateSaldos();
	}
	
	$scope.updateSaldos = function(){
		$scope.total = 0;
		for(var i = 0; i < $scope.gastos.length; i++){
			if($scope.gastos[i].quienesConsumieron.length == 0){
				$scope.gastos[i].porPersona = 0;
			}
			else{
				$scope.gastos[i].porPersona = parseFloat(($scope.gastos[i].cosa.costo/$scope.gastos[i].quienesConsumieron.length).toFixed(2));
			}
			$scope.total += $scope.gastos[i].cosa.costo;
		}
		
		for (var j = 0; j < $scope.personas.length; j++){
			$scope.personas[j].saldo = 0;
			$scope.personas[j].gasto = 0;
			for(var n = 0; n < $scope.gastos.length; n++){
				if($scope.personas[j] === $scope.gastos[n].persona){
					$scope.personas[j].gasto += parseFloat(parseFloat($scope.gastos[n].cosa.costo).toFixed(2));
				}
				for(var x = 0; x < $scope.gastos[n].quienesConsumieron.length; x++){
					if($scope.personas[j] == $scope.gastos[n].quienesConsumieron[x]){
						$scope.personas[j].saldo += parseFloat(($scope.gastos[n].porPersona).toFixed(2));
					}
				}
			}
			$scope.personas[j].saldo -= $scope.personas[j].gasto;
			if($scope.personas[j].saldo < 0){
				$scope.personas[j].mensajeSaldo = "Cobra $" + (($scope.personas[j].saldo * (-1)).toFixed(2)).toString();
				document.getElementById($scope.personas[j].nombre).style.color = "green";
			}
			else if($scope.personas[j].saldo > 0){
				$scope.personas[j].mensajeSaldo = "Paga $" + (($scope.personas[j].saldo).toFixed(2)).toString();
				document.getElementById($scope.personas[j].nombre).style.color = "red";
			}
			else if($scope.personas[j].saldo == 0){
				$scope.personas[j].mensajeSaldo = "Paga $" + (($scope.personas[j].saldo).toFixed(2)).toString();
				document.getElementById($scope.personas[j].nombre).style.color = "green";
			}
		}
	}
	
	$scope.editConsumo = function(gasto,persona,us){
		var index = gasto.quienesConsumieron.indexOf(persona);
		if(index != -1){
			gasto.quienesConsumieron.splice(index, 1);
			var id = gasto.cosa.nombre;
			document.getElementById(id).checked = false;
		}
		else{
			gasto.quienesConsumieron.push(persona);
			if(gasto.quienesConsumieron.length == $scope.personas.length){
				var id = gasto.cosa.nombre;
				document.getElementById(id).checked = true;
			}
		}
		if(us){
			$scope.updateSaldos();
		}
	}
	
	$scope.checkTodos = function(g){
		var id = g.cosa.nombre;
		var todosChecked = document.getElementById(id).checked;
		if(todosChecked){
			for(var i = 0; i < $scope.personas.length; i++){
				var id = $scope.personas[i].nombre+g.cosa.nombre;
				var idCheckboxChecked = document.getElementById(id).checked;
				if(!idCheckboxChecked){
					document.getElementById(id).checked = true;
					$scope.editConsumo(g, $scope.personas[i], false);
				}
			}
		}
		else{
			for(var i = 0; i < $scope.personas.length; i++){
				var id = $scope.personas[i].nombre+g.cosa.nombre;
				var idCheckboxChecked = document.getElementById(id).checked;
				if(idCheckboxChecked){
					document.getElementById(id).checked = false;
					$scope.editConsumo(g, $scope.personas[i], false);
				}
			}
		}
		$scope.updateSaldos();
	}
	
	$scope.changeModo = function(m){
		$scope.modo = m;
	}
		
	window.onbeforeunload = function() {
		if($scope.personas.length != 0 || $scope.gastos.length != 0){
			return "Los datos ingresados se perderán.";
		}
	}
	
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	setTimeout(function(){$('#divAmigosLoader').hide(); $('#divAmigosTable').show(); $scope.$apply();},10000);
	setTimeout(function(){$('#divPageLoader').hide(); $('#divPageContent').show(); $scope.$apply();},5000);
});