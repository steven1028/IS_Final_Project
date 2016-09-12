<!DOCTYPE html>
<html>
	<head>
		<title>IS_Final_Project</title>
	</head>
	<body>
		<!-- Inculde Library -->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/jsbn.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/random.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/hash.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/rsa.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/aes.js"></script>
		<script type="text/javascript" src="/javascripts/cryptico/api.js"></script>
		<script type="text/javascript" src="/javascripts/underscore-min.js"></script>
		<script type="text/javascript" src="/javascripts/backbone-min.js"></script>
		Hello World!
		<script type="text/javascript">
			(function($){
				$(document).ready(function(){
					function print(string){
            			document.write(string + "\n\n");
        			}
        			var Bits = 1024;
					var message = "My name is Steven.";
					var RSAKey = cryptico.generateRSAKey(message, Bits);
					console.log(RSAKey);
					var PublicKeyString = cryptico.publicKeyString(RSAKey); 
					console.log(PublicKeyString);
					var plaintext = "I am Steven.";
					print(plaintext);
					var ciphertext = cryptico.encrypt(plaintext, PublicKeyString);
					console.log(ciphertext);
					print(ciphertext.cipher);
				})
			})(jQuery);
		</script>
	</body>
</html>