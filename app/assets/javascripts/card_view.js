function CardView(model){
  this.model = model;
  this.$el = $("<div></div>");
  this.$el.on("click", ".button", this.deleteCard);
  this.$el.on("click", this.drag.bind(this));
}
CardView.prototype.render = function(){
  this.$el.html('<div class="large-3 columns "><ul class="pricing-table"><li class="title">'+this.model.name+'</li><li class="car_thumb text-center"> </li><li class="description">'+this.model.city_mpg +'MPG City /'+this.model.hwy_mpg+'MPG Hwy</li><li class="bullet-item">$'+this.model.monthly_cost+'mo</li><li class="bullet-item">$'+this.model.yearly_cost+'yr</li><li class="bullet-item purchase-price">$</li><li class="cta-button"><a href="#" class="button round tiny">X</a></li></ul></div>');
  this.addCardPhoto();
  return this.$el;
}

CardView.prototype.addCardPhoto = function() {
	make = $('#make').find(":selected").text();
  model = $('#model').find(":selected").text();
  year = $('#year').find(":selected").text();
  this.getEdmundsPhoto(make, model, year);
}

CardView.prototype.getEdmundsPhoto = function(make, model, year) {
	model = model.split(" ")[0].split("/")[0]; // Use only the first word
	url = "http://api.edmunds.com/api/vehicle/v2/" + make + "/" + model + "?year=" + year + "&view=basic&fmt=json&api_key=xcs69p6sfvqx4dg3tupjg8hn";
	console.log(url);
	var edmundsRequest = $.get(url);
    edmundsRequest.done(function(data){
    	console.log(data);
      car_id = data["years"][0]["styles"][0]["id"];
      currentYear = new Date().getFullYear()
      if (year >= currentYear){
        priceUrl = " http://api.edmunds.com/v1/api/tmv/tmvservice/calculatenewtmv?styleid=" + car_id + "&zip=60610&fmt=json&api_key=xcs69p6sfvqx4dg3tupjg8hn"
      } else {
        mileage = (currentYear - year) * 15000;
        priceUrl = "http://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv?styleid=" + car_id + "&condition=clean&mileage=" + mileage + "&zip=60610&fmt=json&api_key=xcs69p6sfvqx4dg3tupjg8hn";
      }
      
      console.log(priceUrl);
      edmundsPriceRequest = $.get(priceUrl);
      edmundsPriceRequest.done(function(priceData) {
        console.log(priceData);
        if(priceData.tmv.nationalBasePrice.baseMSRP > 0) {
          retail = priceData.tmv.nationalBasePrice.baseMSRP;
        } else {
          retail = priceData.tmv.nationalBasePrice.usedTmvRetail
        }
        $(".purchase-price:first").html("<h5>Est. Retail</h5>$" + String(retail).slice(0, -3) + "," + String(retail).slice(-3));
      });

    	photo_list_url = "http://api.edmunds.com/v1/api/vehiclephoto/service/findphotosbystyleid?styleId=" + car_id + "&fmt=json&api_key=xcs69p6sfvqx4dg3tupjg8hn";
      console.log(photo_list_url);
    	edmundsPhotoRequest = $.get(photo_list_url);
    	edmundsPhotoRequest.done(function(list) {
    		photoTypes = ["S", "F", "FQ", "RQ", "R", "O", "PROFILE", "D", "I"]
    		for( i=0; i < photoTypes.length; i++) {
		    	photoList = list.filter(function(x){
		    		if (x.shotTypeAbbreviation == photoTypes[i]) {return x; }
		    	});
		    	if(typeof photoList[0] !== 'undefined') {
		    		if(typeof photoList[0].photoSrcs !== 'undefined') { break }
		    	}
	    	}
	    	img_html = '<img src="http://media.ed.edmunds-media.com' + photoList[0].photoSrcs[0] + '" />';
	    	console.log(img_html);
   		 	$(".car_thumb:first").html(img_html);
   		});
    });

}

CardView.prototype.displayCard = function(){
  $('.cards').prepend(this.render());
}

CardView.prototype.deleteCard = function(event){
  event.preventDefault();
  $(this).parent().parent().parent().empty();
}
CardView.prototype.drag = function(event){
  this.$el.draggable();
}


