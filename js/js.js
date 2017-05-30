/*	site: blank doc 05/20/2016	mmcguire
	page events not handled by angular


*/
	/*	----------------------------------------------------------------------------
					PAGE LOAD FUNCTIONS
		----------------------------------------------------------------------------	*/

	var aptitudes = {
			aptitude: {}
		}


    function pageload() {
		handle_page_size();
		detect_touch_device();
		get_intro_condition();
		setTimeout(function() {
			setup_intro_and_results();
			setup_aptitude();
			setup_designers();
		},1000); /* */
		setTimeout(function(){
			show_mailform();
		},95000); /* was 95000 design bundle pop up delay in  seconds */
		setTimeout(function(){
			$(".section_close").hide();
			$(".section_close").closest("span").hide();

			scroll_intro();
		},6000); /* intro screen goes away */
	}
	function show_mailform(){
		$(".form-overlay").removeClass("form-hide");
		$(".form-overlay").addClass("form-show");
		$(".form-mailchimp #form_email").focus();
	}
	function hide_mailform(){
		$(".form-overlay").removeClass("form-show");
		$(".form-overlay").addClass("form-hide");
	}

	function detect_touch_device() {
		if (/Mobi/.test(navigator.userAgent)) {
			$('body').addClass('touch_device');
		}else {
			$('body').removeClass('touch_device');
		}
	}

	function handle_page_size() {
		var pageHeader 		= $('.page_header');
		var headerHeight	= pageHeader.height();
		var pageFooter		= $('.page_footer');
		var footerHeight	= pageFooter.height();
		var windowHeight 	= $(window).height()  ;
		var contentHeight	= windowHeight - ((headerHeight+footerHeight)+15);
		$('.content_section').each(function() {
			$(this).css({'height': contentHeight+'px'});
		});
	}

	function setup_intro_and_results() {
		// get graph include and create animated graph bars
		$('.section.intro').find('.fade_in').addClass('show');

		var graph = $('.graph_template').clone().html();
		var graphSection	= $('.section.intro .graphs');
		var resultSection	= $('.section.results');
		var graphs 			= '';

		for (var x=1; x<=9; x++ ) {
			graphs += graph;
		}
		graphSection.html(graphs);
		graphSection.find('.graph:nth-of-type(2)').addClass('accent');
		graphSection.find('.graph').each(function(i) {
			var graph = $(this);
			setTimeout(function() {
				graph.addClass('active');
			},i*600);
		});
		setTimeout(function(){
			resultSection.find('.graph_wrapper').html(graph);
		},1000);
	}

	function setup_aptitude() {
		$.getJSON("js/questions.json", function(data) {
			$.each(data.aptitudes, function(i, item) {
			aptitudes[i] = { type: item.type, area: item.area, score: 0};
			});
		}).then(function() {
			//console.log(JSON.stringify(aptitudes));
		});
	}



	function get_intro_condition() {
		var body = $('body');
		if (localStorage) {
			var condition = localStorage.getItem("introCondition");
			body.addClass(condition);
		}
	}

	function set_intro_condition() {
		// mmcguire
		// saves setting in local storage
		if (localStorage) {
			$(".section_close").hide();
			$(".section_close").closest("span").hide();
			localStorage.setItem("introCondition", "no_intro");
		}
	}









	function scroll_intro() {
		$(this).hide();
		$(this).closest("span").hide();
		var intro 		= $('.section.intro');
		var quiz	= $('.section.quiz');
		intro.removeClass('active');
	}




	/*	----------------------------------------------------------------------------
				PAGE ANIMATION FUNCTIONS
		----------------------------------------------------------------------------	*/


	// accordion functions
	function handle_accordion() {
		var trigger 	= $(this);
		var accordion	= trigger.closest('.accordion');
		var targetData	= trigger.attr('data-target');
		var target		= accordion.find('#'+targetData);
		$('.project_images').scrollLeft(0);
		if (target.hasClass('show')) {
			target.removeClass('show');
		} else {
			$('.accordion_target').not(target).removeClass('show');
			target.addClass('show');
		}
	}



	/*	---------------------------------------------------------------------------
					QUIZ PAGE FUNCTIONS
		---------------------------------------------------------------------------*/
	function handle_quiz_sections() {
		var intro 		= $(this).closest('.question_element')
		var questions	= $('.questions');
		intro.removeClass('active');
		questions.addClass('active');
		$('.question:first-of-type').addClass('active');
		return false;
	}

	function handle_quiz_controls() {
		var control			= $(this);
		var questions		= control.closest('.questions');
		var question		= questions.find('.question.active');
		var firstQuestion	= questions.find('.question:first-of-type');
		var buttons 		= question.find('.buttons');
		var startOver		= questions.find('.start_over');
		var clearQuestion	= question.find('.clear_question');


		/*	-------------------------------------------------------------------
							QUIZ BUTTON
			------------------------------------------------------------------- */
		if ((control.hasClass('quiz_button')) && (!control.hasClass('selected'))) {
			if (control.hasClass('disabled')) {
					var selected = buttons.find('.quiz_button.selected');
					var itemScore = -Math.abs(selected.attr('data-score'));
					buttons.find('.quiz_button').removeClass('disabled selected');
					buttons.find('.arrow.next').addClass('disabled');
					handle_score(selected.attr('data-areas'), itemScore);
			}
			buttons.find('.quiz_button').addClass('disabled');
			if (!question.is(':last-of-type')) {
				buttons.find('.arrow.next').removeClass('disabled');
			}
			if (!question.is(':first-of-type')) {
				buttons.find('.arrow.prev').removeClass('disabled');
			}
			var itemScore = control.attr('data-score');
			startOver.removeClass('disabled');
			// clearQuestion.removeClass('disabled');
			control.addClass('selected');
			handle_score(control.attr('data-areas'), itemScore);
			if (question.is(':last-of-type')) {
				$('.question_element.done').addClass('active');
				setTimeout(function() {
					setup_results();
				},1500);
			} else {
				slide_questions();
			}


		/*	-------------------------------------------------------------------
							ARROW BUTTON
			------------------------------------------------------------------- */
		} else if (control.hasClass('arrow')) {
			slide_questions();

		/*	-------------------------------------------------------------------
							START OVER
			------------------------------------------------------------------- */
		} else if (control.hasClass('start_over')) {
			// go back to the first question and clear answeres
			questions.find('.quiz_button').removeClass('disabled selected');
			questions.find('.arrow.next').addClass('disabled');
			questions.find('.question').not(firstQuestion).removeClass('active prev next');
			firstQuestion.addClass('active');
			$.each(aptitudes, function(i,item){
				item.score = 0;
			});
			update_test_output();
		}


		function slide_questions() {
			// slide active and 'next' question to the left or right
			if (control.hasClass('next')) {
				var newQuestion = question.next();
				newQuestion.addClass('next');
				question.addClass('prev');
			} else {
				var newQuestion = question.prev();
			}
			question.removeClass('active');
			newQuestion.addClass('active').removeClass('next prev');

		}
	}

	function handle_score(areas, itemScore) {
		// loop through aptitudes object. for each area that matches an aptitudes item, update score
		var areaList = "";
		if (areas != undefined) areaList = areas.split(",");
		$.each(areaList, function(i) {
			var areaItem = areaList[i].trim();
			$.each(aptitudes, function(i,item){
				if (item.area == areaItem) {
					item.score = (parseInt(item.score) + parseInt(itemScore));
				}
			});
update_test_output();
		});
	}

	function setup_results() {
		// use aptitudes object to setup results
		var results 		= $('.section.results');
		var fields 			= results.find('.fields');
		var balance 		= $('.field_balance');
		var focus 			= $('.field_focus');
		var itemScore		= 0;
		var highScore 		= 0;
		var firstArea		= '';
		var inHouseScore	= 0;
		var agencyScore 	= 0;
		var specialistScore = 0;
		var generalistScore = 0;

		results.addClass('active');
		var result_text = "";
		$.each(aptitudes, function(i,item){
			if (item.type=='aptitude') {
				itemScore = parseInt(item.score) || 0;
				var graph	= fields.find('.field.'+item.area).find('.field_graph');
				graph.attr('data-score', itemScore);
				var text = fields.find('.field.'+item.area).find('.rotate');
				if ( itemScore> highScore) {
					highScore = itemScore;
				}
			}
			//console.log(highScore+' ' + itemScore);
		});

		setTimeout(function() {
			var hs = 0;
			$.each(aptitudes, function(i,item){
				var itemScore = parseInt(item.score);
				if (item.type=='aptitude') {
					setTimeout(function() {
						var graph	= fields.find('.field.'+item.area).find('.field_graph');
						var field 	= graph.closest('.field');
						//var rise	= 26-(itemScore*5);
						var rise = 4+(itemScore*2.1);   	//was orginally *5);
						graph.css({'height':rise+'rem'});
						var score = parseInt(graph.attr('data-score'));
						if (score == highScore) {
							hs++;
							result_text += item.area.replace("_"," ") + ", " ;
							var res_txt = result_text.substr(0,result_text.length-2);
							if (hs > 2) res_txt = res_txt.substr(0,res_txt.lastIndexOf(",")) + ", and " + res_txt.substr(res_txt.lastIndexOf(",")+1,res_txt.length);
							if (hs == 2) res_txt = res_txt.substr(0,res_txt.lastIndexOf(",")) + " and " + res_txt.substr(res_txt.lastIndexOf(",")+1,res_txt.length);
							$(".high_area").html(res_txt);
							result_url="https://twitter.com/intent/tweet?text=I just ranked highly for "+res_txt+" at http://designauthority.co %F0%9F%93%8A %F0%9F%99%8C&amp;related=twitterapi%2Ctwitter";
							$(".resp-sharing-button__link:first-child").attr("href",result_url);	

							graph.addClass('high_score');
							$('.field_detail.'+item.area).addClass('high_score');
							field.find('.field_detail').addClass('high_score');
							field.find('.field_label').addClass('high_score');
							$('.field_details').addClass('show');

							if (firstArea== '') {
								firstArea = item.area;
								$('.field_detail.'+item.area).addClass('active');
								field.find('.field_label').addClass('active');
							}
						}
					},i*700);
				} else {
					if (item.area == 'In-house') {
						inHouseScore = parseInt(item.score);
					}
					if (item.area == 'Agency') {
						agencyScore = parseInt(item.score);
					}
					if (item.area == 'Specialist') {
						specialistScore = parseInt(item.score);
					}
					if (item.area == 'Generalist') {
						generalistScore = parseInt(item.score);
					}
				}
			});

			if (inHouseScore > agencyScore) {
				balance.find('.In-house').addClass('show');
			} else {
				balance.find('.Agency').addClass('show');
			}
			if (specialistScore > generalistScore) {
				focus.find('.Specialist').addClass('show');
			} else {
				focus.find('.Generalist').addClass('show');
			}

		},1600);

		setup_designers();
	}


	function handle_result_fields() {
		var control 	= ($(this).next().length==0)?$(this):$(this).next();
		var fields 		= control.closest('.fields');
		var fieldDetails= $('.field_details');
		var target		= control.attr('data-target');
		var detail		= $('.field_detail.'+target);
		fields.find('.field_label').not(control).removeClass('active');
		control.addClass('active');

		fieldDetails.find('.field_detail').not(detail).removeClass('active');
		detail.addClass('active');

	}

	function setup_designers() {
		var designerWrapper = $('.section.results');
		designerWrapper.find('.designers').each(function() {
			var designers = $(this);
			if ($(window).width() >500) {
				var wrapperWidth = designers.width();
				designers.find('.designer').css({'width': (wrapperWidth/2)+'px'});
			} else {
				designers.find('.designer').css({'width': '100vw'});
			}

			var numElements 	= designers.find('.designer').length;
			var wraperWidth		= designers.find('.designer_wrapper').width();
			if (numElements < 2) {
				designers.find('.designer_wrapper').addClass('single');
			} else  {
				designers.find('.arrow_wrapper.next').addClass('show');
			}
		});
	}

	function handle_designers() {
		var control 	= $(this);
		var aptitude	= control.closest('.aptitude');
		var designers	= control.closest('.designers');
		var wrapper 	= designers.find('.designer_wrapper');
		var wrapperLeft	= parseInt(wrapper.css('left'));
		var wrapperWidth= designers.width();
		var numElements	= designers.find('.designer').length;
		if ($(window).width() <500) {
			var showing		= 1;
		} else {
			var showing		= 2;
		}
		var maxLeft		= (wrapperWidth/showing)*(numElements-showing);
		var nextArrow	= designers.find('.arrow_wrapper.next');
		var prevArrow	= designers.find('.arrow_wrapper.prev');
		if (control.hasClass('next')) {
			if (wrapperLeft > (wrapperWidth-((wrapperWidth/showing)*numElements))) {
				var newLeft = (wrapperLeft - (designers.width()/showing));
		console.log(newLeft);
				wrapper.css({'left': newLeft+'px'});
				prevArrow.addClass('show');
				if (Math.abs(newLeft)>= maxLeft ){
					nextArrow.removeClass('show');
				}
			}
		} else {
			if (wrapperLeft < 0) {
				nextArrow.addClass('show');
				var newLeft = (wrapperLeft + (designers.width()/showing));
		console.log(newLeft);
				wrapper.css({'left': newLeft+'px'});
				if (Math.abs(newLeft)<= 0 ){
					prevArrow.removeClass('show');
				}
			}
		}
		aptitude.find('.examples').removeClass('show_all');
	}

	function handle_show_examples() {
		var button 	= $(this);
		var examples = button.closest('.examples');
		examples.addClass('show_all');
	}

	function handle_mouseover_image(){
		$(this).hide();
		$(this).next().show();
	}

	function handle_mouseleave_image(){
		$(this).hide();
		$(this).prev().show();
	}


	/* -----------------------------------------------------------------------------
	 *         						PAGE LOAD EVENTS
	 *  ---------------------------------------------------------------------------- */

	// set header and footer on page scroll, resize, and page load
	handle_page_size();




	/* -------------------------------------------------------------------------------------
	 *                  			DOCUMENT-READY EVENTS
	 * ------------------------------------------------------------------------------------- */

	$(document).ready(function() {


	/* --------------------------	MAIN EVENTS	-------------------------------------------- */
		function main() {
			var body = $('body');

			pageload();

			// scroll and resize events
			$(window).resize(function() {			handle_page_size();			});
    		body.on('click', '.section_close', 		scroll_intro 				);	// closes intro with either button click
			body.on('click', '.next_link_container', scroll_intro 				);	// ** New expanded hit state **
			body.on('click', '.set_condition', 		set_intro_condition 		);	// sets 'don't show intro'
			body.on('click', '.start_quiz_button', 	handle_quiz_sections		);
			body.on('click', '.quiz_control', 		handle_quiz_controls		);
			body.on('click', '.field_graph_wrapper', 		handle_result_fields		);
			body.on('click', '.field_label', 		handle_result_fields		);
			body.on('click', '.arrow_wrapper', 		handle_designers			);
			body.on('click', '.all_examples', 		handle_show_examples		);
			body.on('mouseover', '.example .image', 		handle_mouseover_image		);
			body.on('mouseleave', '.example .himage', 		handle_mouseleave_image		);
			body.on('click', '.form_close_button', 			hide_mailform			);
			body.on('click', '.form-overlay', function(e){
				if (e.target === this)
					hide_mailform();
			});
		}

		main();

	});


	/*
						RESET LOCALSTORAGE FOR INTRO CONDITION TESTING	-- mmcguire
						remove or comment-out for production

	*/
	/*


	$(function() {
		var body = $('body');
		var resetButton = '<button class="reset_intro" style="position: absolute; top: 1vh; right: 1vw; z-index: 100;" type="button">reset intro condition</button>';
		body.append(resetButton);

		body.on('click', '.reset_intro', function() {localStorage.setItem("introCondition", ""); location.reload();})
	});

	*/

	// ----- TEST OUTPUT ------
	function update_test_output() {
		var testOutput = $('.test_output');
		$.each(aptitudes, function(i, item) {
			testOutput.find('.'+item.area).find('.score').text(item.score);
		});
	}
	// END TEST OUTPUT
