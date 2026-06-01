function agregarProducto() {
    // Capturamos lo que el usuario escribió en la pantalla
    let nombreInput = $('#nombreProducto').val();
    let precioInput = $('#precioProducto').val();

    // Validación básica en el Frontend
    if(!nombreInput || !precioInput) {
        alert("Por favor, llena todos los campos.");
        return;
    }

    let nuevoProducto = {
        nombre: nombreInput,
        precio: parseFloat(precioInput) 
    };

    $.ajax({
        url: 'https://myapi.tesvg.com.mx/productos',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(nuevoProducto),
        success: function(resultado) {
            alert('Producto agregado con éxito');
            // Limpiamos los inputs del formulario
            $('#nombreProducto').val('');
            $('#precioProducto').val('');
	    getProducts();
	    
        },
        error: function() {
            alert('Error al conectar con el servidor.');
        }
    });
    
}



function limpiar(){
    $('#productos').html("");
}

function eliminarProducto(productId){

    let url = 'https://myapi.tesvg.com.mx/productos/' + productId;
    alert(url);
    $.ajax({
	url: url,
	type: 'DELETE',
	success: function(resultado) {
	    limpiar();
            getProducts();
	},
	error: function(error) {
            console.error('Hubo un error al eliminar:', error);
            alert('No se pudo eliminar el producto.');
	}
    });

    
}



    
function getProducts(){
    limpiar();
  $.ajax ({url: 'https://myapi.tesvg.com.mx/productos',
	     cache: false,
	     success: function (result) {
		 console.log(result[0]);


		 // 2. Recorremos el array con $.each de jQuery
		 $.each(result, function(index, productos) {
		     // Creamos la estructura HTML con los datos
		     var itemHtml = "<div class='col-12 col-sm-6 col-md-3'> <div class='card mb-4 shadow border-primary'><div class='card-body'><h4>" +
			 productos.nombre +
			 "</h4><h5> Precio: " +
			 productos.precio +
			 "</h5></div><div class='card-footer bg-white d-flex justify-content-end'><button class='btn btn-sm btn-outline-primary' onclick='eliminarProducto("+
		     productos.id +
");'>Eliminar</button></div></div></div>";
		     
		     // 3. Lo agregamos al contenedor en el HTML
		     $('#productos').append(itemHtml);
		 });


		 
	     }
	    });
}

