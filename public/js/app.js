new Vue({
	el: '#eventApp',
	data: {
		title: '',
		description: '',
		message: '',
		events: [],
		deleted_message: ''
	},
	ready: function(){
		this.fetchEvents();
	},
	methods:{
		fetchEvents: function(){
			this.$http.get('events', function(events , status){
				
				this.events = events;
			})
		},
		createEvent: function(e){
			if(this.title.length > 3 && this.description.length > 8)
			{
				this.$http.post('events/add' , {title: this.title, description: this.description}, function(data , status){
				console.log(data.message);
				this.fetchEvents();
				$( "#message" ).addClass( "alert alert-success" );
				this.message = data.message;
				});
			}else{
				alert('El título debe tener al menos 3 carácteres y la descripción 7')
			}
			e.preventDefault();
			
		},
		deleteEvent: function(id){
			this.$http.post('events/delete',{id: id} , function(message , status){
				$( "#deleted_message" ).addClass( "alert alert-success" );
				this.deleted_message = message.message;
				this.fetchEvents();

			});
		
		}
	}
})