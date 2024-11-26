// Obtener la fecha actual y sumar un día para establecer la fecha mínima
let min = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0];
let max = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

// Establecer la fecha mínima y máxima en el input de fecha
document.getElementById('appointment-date').setAttribute('min', min);
document.getElementById('appointment-date').setAttribute('max', max);

const dateInput = document.getElementById('appointment-date');
dateInput.value = min; // Establecer el valor mínimo de la fecha

// Array que simula horarios reservados (lo ideal sería traer esta info de una base de datos)
let reservedSlots;

// Establecer la fecha mínima en el input de fecha
document.addEventListener('DOMContentLoaded', function() {
    // Hacer una solicitud fetch para obtener los horarios reservados desde el servidor
    fetch('/reserved-slots')
        .then(response => response.json())
        .then(data => {
            // Asignar los datos obtenidos a la variable reservedSlots
            reservedSlots = data;
            console.log('Horarios reservados:', reservedSlots);

            // Una vez obtenidos los horarios reservados, actualizamos los slots disponibles
            updateTimeSlots();
        })
        .catch(error => {
            console.error('Error al obtener los horarios reservados:', error);

        });

    fetch('/obtenerServicios') // Cambia la URL según tu configuración del backend
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('selectTratBelleza');

            // Limpiar opciones existentes, excepto la opción por defecto
            selectElement.innerHTML = '<option value="">Seleccione un servicio</option>';

            // Llenar el select con los servicios obtenidos
            data.forEach(servicio => {
                const option = document.createElement('option');
                option.value = servicio.nombre; // O el campo que uses para el valor
                option.textContent = servicio.nombre; // O el campo que uses para mostrar
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener los servicios:', error);
        });

});

// Array con los horarios disponibles
const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const confirmButton = document.getElementById('confirm-btn');
let selectedTime = null;

// Función para actualizar los horarios según la fecha seleccionada
function updateTimeSlots() {
    const selectedDate = dateInput.value;
    timeSlotsContainer.innerHTML = ''; // Limpiar los botones de horarios
    selectedTime = null;
    confirmButton.disabled = true;

    if (selectedDate) {
        const reservedForDate = reservedSlots[selectedDate] || [];

        // Crear un contenedor de grilla solo si no existe
        let grid = document.querySelector('.time-picker-section .grid-container');
        if (!grid) {
            grid = document.createElement('div');
            grid.classList.add('grid-container');
            timeSlotsContainer.appendChild(grid); // Añadir la grilla al contenedor principal
        } else {
            grid.innerHTML = ''; // Limpiar los botones si la grilla ya existe
        }

        timeSlots.forEach(time => {
            const isReserved = reservedForDate.includes(time);
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-secondary', 'time-slot-btn');
            button.textContent = time;

            if (isReserved) {
                button.classList.add('disabled');
                button.disabled = true;
            } else {
                button.addEventListener('click', () => {
                    event.preventDefault(); // Prevenir el envío del formulario

                    // Deseleccionar el anterior botón si había uno seleccionado
                    const selectedBtn = document.querySelector('.time-slot-btn.selected');
                    if (selectedBtn) {
                        selectedBtn.classList.remove('selected');
                    }

                    selectedTime = time;
                    confirmButton.disabled = false; // Habilitar el botón de confirmar
                });
            }
            grid.appendChild(button);
        });
    }
}


// Al cambiar la fecha, se actualizan los horarios
dateInput.addEventListener('change', updateTimeSlots);

// Al cargar la página, se actualizan los horarios
document.addEventListener('DOMContentLoaded', updateTimeSlots);

// Obtén el elemento select por su ID
const selectElement = document.getElementById('selectTratBelleza');

// Función para obtener el valor seleccionado
function obtenerValorSeleccionado() {
    const valorSeleccionado = selectElement.value; // Obtiene el valor del select
    console.log(valorSeleccionado); // Muestra el valor en la consola
    // Aquí puedes hacer lo que necesites con el valor seleccionado
}

// Confirmación del turno
confirmButton.addEventListener('click', () => {
    if (selectedTime && selectElement.value && dateInput.value) {

        document.getElementById('selectedtime').value = selectedTime;
        auxSelectedTime = selectedTime;
        document.getElementById('selecteddate').value = dateInput.value;
        document.getElementById('selectedtreatment').value = selectElement.value;

        fetch('/check-session', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.loggedin) {
                console.log('Sesión iniciada:', data.user);
                document.querySelector('Form').submit();

                alert(`Turno confirmado para el servicio ${selectElement.value} el día ${dateInput.value} a las ${auxSelectedTime}`);

                // Muestra el contenido para usuarios con sesión iniciada
            } else {
                //console.log('Sesión no iniciada');
                alert(`Turno no confirmado, inicie sesión.`);
                // Redirige al usuario a la página de inicio de sesión o muestra contenido no autenticado
            }
        });


    } else {
        alert('Por favor, completa todos los campos.');
    }

    selectedTime = null;
    confirmButton.disabled = true;
});
