// Calendar: a Javascript class for Mootools that adds accessible and unobtrusive date pickers to your form elements <http://electricprism.com/aeron/calendar>
// Calendar RC4, Copyright (c) 2007 Aeron Glemann <http://electricprism.com/aeron>, MIT Style License.

var Calendar = new Class(
		{
			options : {
				blocked : [],
				classes : [],
				days : [ "Sunday", "Monday", "Tuesday", "Wednesday",
						"Thursday", "Friday", "Saturday" ],
				direction : 0,
				draggable : true,
				months : [ "January", "February", "March", "April", "May",
						"June", "July", "August", "September", "October",
						"November", "December" ],
				navigation : 1,
				offset : 0,
				onHideStart : Class.empty,
				onHideComplete : Class.empty,
				onShowStart : Class.empty,
				onShowComplete : Class.empty,
				pad : 1,
				tweak : {
					x : 0,
					y : 0
				}
			},
			initialize : function(F, B) {
				if (!F) {
					return false
				}
				this.setOptions(B);
				var D = [ "calendar", "prev", "next", "month", "year", "today",
						"invalid", "valid", "inactive", "active", "hover",
						"hilite" ];
				var A = D.map(function(J, I) {
					if (this.options.classes[I]) {
						if (this.options.classes[I].length) {
							J = this.options.classes[I]
						}
					}
					return J
				}, this);
				this.classes = A.associate(D);
				this.calendar = new Element("div", {
					styles : {
						left : "-1000px",
						opacity : 0,
						position : "absolute",
						top : "-1000px",
						zIndex : 1000
					}
				}).addClass(this.classes.calendar).injectInside(document.body);
				if (window.ie6) {
					this.iframe = new Element("iframe", {
						styles : {
							left : "-1000px",
							position : "absolute",
							top : "-1000px",
							zIndex : 999
						}
					}).injectInside(document.body);
					this.iframe.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)"
				}
				this.fx = this.calendar.effect("opacity", {
					onStart : function() {
						if (this.calendar.getStyle("opacity") == 0) {
							if (window.ie6) {
								this.iframe.setStyle("display", "block")
							}
							this.calendar.setStyle("display", "block");
							this.fireEvent("onShowStart", this.element)
						} else {
							this.fireEvent("onHideStart", this.element)
						}
					}.bind(this),
					onComplete : function() {
						if (this.calendar.getStyle("opacity") == 0) {
							this.calendar.setStyle("display", "none");
							if (window.ie6) {
								this.iframe.setStyle("display", "none")
							}
							this.fireEvent("onHideComplete", this.element)
						} else {
							this.fireEvent("onShowComplete", this.element)
						}
					}.bind(this)
				});
				if (window.Drag && this.options.draggable) {
					this.drag = new Drag.Move(this.calendar, {
						onDrag : function() {
							if (window.ie6) {
								this.iframe.setStyles({
									left : this.calendar.style.left,
									top : this.calendar.style.top
								})
							}
						}.bind(this)
					})
				}
				this.calendars = [];
				var H = 0;
				var G = new Date();
				G.setDate(G.getDate() + this.options.direction.toInt());
				for ( var C in F) {
					var E = {
						button : new Element("button", {
							type : "button"
						}),
						el : _(C),
						els : [],
						id : H++,
						month : G.getMonth(),
						visible : false,
						year : G.getFullYear()
					};
					if (!this.element(C, F[C], E)) {
						continue
					}
					E.el.addClass(this.classes.calendar);
					E.button.addClass(this.classes.calendar).addEvent("click",
							function(I) {
								this.toggle(I)
							}.pass(E, this)).injectAfter(E.el);
					E.val = this.read(E);
					_extend(E, this.bounds(E));
					_extend(E, this.values(E));
					this.rebuild(E);
					this.calendars.push(E)
				}
			},
			blocked : function(C) {
				var A = [];
				var D = new Date(C.year, C.month, 1).getDay();
				var B = new Date(C.year, C.month + 1, 0).getDate();
				this.options.blocked.each(function(I) {
					var G = I.split(" ");
					for ( var J = 0; J <= 3; J++) {
						if (!G[J]) {
							G[J] = (J == 3) ? "" : "*"
						}
						G[J] = G[J].contains(",") ? G[J].split(",")
								: new Array(G[J]);
						var K = G[J].length - 1;
						for ( var H = K; H >= 0; H--) {
							if (G[J][H].contains("-")) {
								var L = G[J][H].split("-");
								for ( var F = L[0]; F <= L[1]; F++) {
									if (!G[J].contains(F)) {
										G[J].push(F + "")
									}
								}
								G[J].splice(H, 1)
							}
						}
					}
					if (G[2].contains(C.year + "") || G[2].contains("*")) {
						if (G[1].contains(C.month + 1 + "")
								|| G[1].contains("*")) {
							G[0].each(function(M) {
								if (M > 0) {
									A.push(M.toInt())
								}
							});
							if (G[3]) {
								for ( var J = 0; J < B; J++) {
									var E = (J + D) % 7;
									if (G[3].contains(E + "")) {
										A.push(J + 1)
									}
								}
							}
						}
					}
				}, this);
				return A
			},
			bounds : function(C) {
				var D = new Date(1000, 0, 1);
				var A = new Date(2999, 11, 31);
				var B = new Date().getDate() + this.options.direction.toInt();
				if (this.options.direction > 0) {
					D = new Date();
					D.setDate(B + this.options.pad * C.id)
				}
				if (this.options.direction < 0) {
					A = new Date();
					A.setDate(B - this.options.pad
							* (this.calendars.length - C.id - 1))
				}
				C.els.each(function(F) {
					if (F.getTag() == "select") {
						if (F.format.test("(y|Y)")) {
							var E = [];
							F.getChildren().each(function(J) {
								var I = this.unformat(J.value, F.format);
								if (!E.contains(I[0])) {
									E.push(I[0])
								}
							}, this);
							E.sort(this.sort);
							if (E[0] > D.getFullYear()) {
								d = new Date(E[0], D.getMonth() + 1, 0);
								if (D.getDate() > d.getDate()) {
									D.setDate(d.getDate())
								}
								D.setYear(E[0])
							}
							if (E.getLast() < A.getFullYear()) {
								d = new Date(E.getLast(), A.getMonth() + 1, 0);
								if (A.getDate() > d.getDate()) {
									A.setDate(d.getDate())
								}
								A.setYear(E.getLast())
							}
						}
						if (F.format.test("(F|m|M|n)")) {
							var G = [];
							var H = [];
							F.getChildren().each(
									function(J) {
										var I = this
												.unformat(J.value, F.format);
										if (_type(I[0]) != "number"
												|| I[0] == E[0]) {
											if (!G.contains(I[1])) {
												G.push(I[1])
											}
										}
										if (_type(I[0]) != "number"
												|| I[0] == E.getLast()) {
											if (!H.contains(I[1])) {
												H.push(I[1])
											}
										}
									}, this);
							G.sort(this.sort);
							H.sort(this.sort);
							if (G[0] > D.getMonth()) {
								d = new Date(D.getFullYear(), G[0] + 1, 0);
								if (D.getDate() > d.getDate()) {
									D.setDate(d.getDate())
								}
								D.setMonth(G[0])
							}
							if (H.getLast() < A.getMonth()) {
								d = new Date(D.getFullYear(), H.getLast() + 1,
										0);
								if (A.getDate() > d.getDate()) {
									A.setDate(d.getDate())
								}
								A.setMonth(H.getLast())
							}
						}
					}
				}, this);
				return {
					start : D,
					end : A
				}
			},
			caption : function(G) {
				var A = {
					prev : {
						month : true,
						year : true
					},
					next : {
						month : true,
						year : true
					}
				};
				if (G.year == G.start.getFullYear()) {
					A.prev.year = false;
					if (G.month == G.start.getMonth()
							&& this.options.navigation == 1) {
						A.prev.month = false
					}
				}
				if (G.year == G.end.getFullYear()) {
					A.next.year = false;
					if (G.month == G.end.getMonth()
							&& this.options.navigation == 1) {
						A.next.month = false
					}
				}
				if (_type(G.months) == "array") {
					if (G.months.length == 1 && this.options.navigation == 2) {
						A.prev.month = A.next.month = false
					}
				}
				var B = new Element("caption");
				var E = new Element("a").addClass(this.classes.prev)
						.appendText("\x3c");
				var D = new Element("a").addClass(this.classes.next)
						.appendText("\x3e");
				if (this.options.navigation == 2) {
					var F = new Element("span").addClass(this.classes.month)
							.injectInside(B);
					if (A.prev.month) {
						E.clone().addEvent("click", function(H) {
							this.navigate(H, "m", -1)
						}.pass(G, this)).injectInside(F)
					}
					F.adopt(new Element("span")
							.appendText(this.options.months[G.month]));
					if (A.next.month) {
						D.clone().addEvent("click", function(H) {
							this.navigate(H, "m", 1)
						}.pass(G, this)).injectInside(F)
					}
					var C = new Element("span").addClass(this.classes.year)
							.injectInside(B);
					if (A.prev.year) {
						E.clone().addEvent("click", function(H) {
							this.navigate(H, "y", -1)
						}.pass(G, this)).injectInside(C)
					}
					C.adopt(new Element("span").appendText(G.year));
					if (A.next.year) {
						D.clone().addEvent("click", function(H) {
							this.navigate(H, "y", 1)
						}.pass(G, this)).injectInside(C)
					}
				} else {
					if (A.prev.month && this.options.navigation) {
						E.clone().addEvent("click", function(H) {
							this.navigate(H, "m", -1)
						}.pass(G, this)).injectInside(B)
					}
					B.adopt(new Element("span").addClass(this.classes.month)
							.appendText(this.options.months[G.month]));
					B.adopt(new Element("span").addClass(this.classes.year)
							.appendText(G.year));
					if (A.next.month && this.options.navigation) {
						D.clone().addEvent("click", function(H) {
							this.navigate(H, "m", 1)
						}.pass(G, this)).injectInside(B)
					}
				}
				return B
			},
			changed : function(A) {
				A.val = this.read(A);
				_extend(A, this.values(A));
				this.rebuild(A);
				if (!A.val) {
					return
				}
				if (A.val.getDate() < A.days[0]) {
					A.val.setDate(A.days[0])
				}
				if (A.val.getDate() > A.days.getLast()) {
					A.val.setDate(A.days.getLast())
				}
				A.els.each(function(B) {
					B.value = this.format(A.val, B.format)
				}, this);
				this.check(A);
				this.calendars.each(function(B) {
					if (B.visible) {
						this.display(B)
					}
				}, this)
			},
			check : function(A) {
				this.calendars.each(function(D, B) {
					if (D.val) {
						var E = false;
						if (B < A.id) {
							var C = new Date(Date.parse(A.val));
							C.setDate(C.getDate()
									- (this.options.pad * (A.id - B)));
							if (C < D.val) {
								E = true
							}
						}
						if (B > A.id) {
							var C = new Date(Date.parse(A.val));
							C.setDate(C.getDate()
									+ (this.options.pad * (B - A.id)));
							if (C > D.val) {
								E = true
							}
						}
						if (E) {
							if (D.start > C) {
								C = D.start
							}
							if (D.end < C) {
								C = D.end
							}
							D.month = C.getMonth();
							D.year = C.getFullYear();
							_extend(D, this.values(D));
							D.val = D.days.contains(C.getDate()) ? C : null;
							this.write(D);
							if (D.visible) {
								this.display(D)
							}
						}
					} else {
						D.month = A.month;
						D.year = A.year
					}
				}, this)
			},
			clicked : function(C, A, B) {
				B.val = (this.value(B) == A) ? null : new Date(B.year, B.month,
						A);
				this.write(B);
				if (!B.val) {
					B.val = this.read(B)
				}
				if (B.val) {
					this.check(B);
					this.toggle(B)
				} else {
					C.addClass(this.classes.valid);
					C.removeClass(this.classes.active)
				}
			},
			display : function(J) {
				this.calendar.empty();
				this.calendar.className = this.classes.calendar + " "
						+ this.options.months[J.month].toLowerCase();
				var K = new Element("div").injectInside(this.calendar);
				var R = new Element("table").injectInside(K).adopt(
						this.caption(J));
				var Q = new Element("thead").injectInside(R);
				var B = new Element("tr").injectInside(Q);
				for ( var P = 0; P <= 6; P++) {
					var E = this.options.days[(P + this.options.offset) % 7];
					B.adopt(new Element("th", {
						title : E
					}).appendText(E.substr(0, 1)))
				}
				var A = new Element("tbody").injectInside(R);
				var B = new Element("tr").injectInside(A);
				var T = new Date(J.year, J.month, 1);
				var D = ((T.getDay() - this.options.offset) + 7) % 7;
				var I = new Date(J.year, J.month + 1, 0).getDate();
				var L = new Date(J.year, J.month, 0).getDate();
				var F = this.value(J);
				var N = J.days;
				var M = [];
				var G = [];
				this.calendars
						.each(
								function(X, W) {
									if (X != J && X.val) {
										if (J.year == X.val.getFullYear()
												&& J.month == X.val.getMonth()) {
											M.push(X.val.getDate())
										}
										if (J.val) {
											for ( var V = 1; V <= I; V++) {
												T.setDate(V);
												if ((W < J.id && T > X.val && T < J.val)
														|| (W > J.id
																&& T > J.val && T < X.val)) {
													if (!G.contains(V)) {
														G.push(V)
													}
												}
											}
										}
									}
								}, this);
				var T = new Date();
				var S = new Date(T.getFullYear(), T.getMonth(), T.getDate())
						.getTime();
				for ( var P = 1; P < 43; P++) {
					if ((P - 1) % 7 == 0) {
						B = new Element("tr").injectInside(A)
					}
					var H = new Element("td").injectInside(B);
					var O = P - D;
					var U = new Date(J.year, J.month, O);
					var C = "";
					if (O === F) {
						C = this.classes.active
					} else {
						if (M.contains(O)) {
							C = this.classes.inactive
						} else {
							if (N.contains(O)) {
								C = this.classes.valid
							} else {
								if (O >= 1 && O <= I) {
									C = this.classes.invalid
								}
							}
						}
					}
					if (U.getTime() == S) {
						C = C + " " + this.classes.today
					}
					if (G.contains(O)) {
						C = C + " " + this.classes.hilite
					}
					H.addClass(C);
					if (N.contains(O)) {
						H.setProperty("title", this.format(U, "D M jS Y"));
						H.addEvents({
							click : function(X, V, W) {
								this.clicked(X, V, W)
							}.pass([ H, O, J ], this),
							mouseover : function(W, V) {
								W.addClass(V)
							}.pass([ H, this.classes.hover ]),
							mouseout : function(W, V) {
								W.removeClass(V)
							}.pass([ H, this.classes.hover ])
						})
					}
					if (O < 1) {
						O = L + O
					} else {
						if (O > I) {
							O = O - I
						}
					}
					H.appendText(O)
				}
			},
			element : function(B, C, D) {
				if (_type(C) == "object") {
					for ( var A in C) {
						if (!this.element(A, C[A], D)) {
							return false
						}
					}
					return true
				}
				B = _(B);
				if (!B) {
					return false
				}
				B.format = C;
				if (B.getTag() == "select") {
					B.addEvent("change", function(E) {
						this.changed(E)
					}.pass(D, this))
				} else {
					B.readOnly = true;
					B.addEvent("focus", function(E) {
						this.toggle(E)
					}.pass(D, this))
				}
				D.els.push(B);
				return true
			},
			format : function(C, K) {
				var I = "";
				if (C) {
					var E = C.getDate();
					var L = C.getDay();
					var D = this.options.days[L];
					var B = C.getMonth() + 1;
					var H = this.options.months[B - 1];
					var J = C.getFullYear() + "";
					for ( var F = 0, G = K.length; F < G; F++) {
						var A = K.charAt(F);
						switch (A) {
						case "y":
							J = J.substr(2);
						case "Y":
							I += J;
							break;
						case "m":
							if (B < 10) {
								B = "0" + B
							}
						case "n":
							I += B;
							break;
						case "M":
							H = H.substr(0, 3);
						case "F":
							I += H;
							break;
						case "d":
							if (E < 10) {
								E = "0" + E
							}
						case "j":
							I += E;
							break;
						case "D":
							D = D.substr(0, 3);
						case "l":
							I += D;
							break;
						case "N":
							L += 1;
						case "w":
							I += L;
							break;
						case "S":
							if (E % 10 == 1 && E != "11") {
								I += "st"
							} else {
								if (E % 10 == 2 && E != "12") {
									I += "nd"
								} else {
									if (E % 10 == 3 && E != "13") {
										I += "rd"
									} else {
										I += "th"
									}
								}
							}
							break;
						default:
							I += A
						}
					}
				}
				return I
			},
			navigate : function(C, B, D) {
				switch (B) {
				case "m":
					if (_type(C.months) == "array") {
						var A = C.months.indexOf(C.month) + D;
						if (A < 0 || A == C.months.length) {
							if (this.options.navigation == 1) {
								this.navigate(C, "y", D)
							}
							A = (A < 0) ? C.months.length - 1 : 0
						}
						C.month = C.months[A]
					} else {
						var A = C.month + D;
						if (A < 0 || A == 12) {
							if (this.options.navigation == 1) {
								this.navigate(C, "y", D)
							}
							A = (A < 0) ? 11 : 0
						}
						C.month = A
					}
					break;
				case "y":
					if (_type(C.years) == "array") {
						var A = C.years.indexOf(C.year) + D;
						C.year = C.years[A]
					} else {
						C.year += D
					}
					break
				}
				_extend(C, this.values(C));
				if (_type(C.months) == "array") {
					var A = C.months.indexOf(C.month);
					if (A < 0) {
						C.month = C.months[0]
					}
				}
				this.display(C)
			},
			read : function(C) {
				var A = [ null, null, null ];
				C.els.each(function(F) {
					var E = this.unformat(F.value, F.format);
					E.each(function(H, G) {
						if (_type(H) == "number") {
							A[G] = H
						}
					})
				}, this);
				if (_type(A[0]) == "number") {
					C.year = A[0]
				}
				if (_type(A[1]) == "number") {
					C.month = A[1]
				}
				var D = null;
				if (A.every(function(E) {
					return _type(E) == "number"
				})) {
					var B = new Date(A[0], A[1] + 1, 0).getDate();
					if (A[2] > B) {
						A[2] = B
					}
					D = new Date(A[0], A[1], A[2])
				}
				return (C.val == D) ? null : D
			},
			rebuild : function(A) {
				A.els.each(function(B) {
					if (B.getTag() == "select" && B.format.test("^(d|j)_")) {
						var C = this.value(A);
						if (!C) {
							C = B.value.toInt()
						}
						B.empty();
						A.days.each(function(D) {
							var E = new Element("option", {
								selected : (C == D),
								value : ((B.format == "d" && D < 10) ? "0" + D
										: D)
							}).appendText(D).injectInside(B)
						}, this)
					}
				}, this)
			},
			sort : function(B, A) {
				return B - A
			},
			toggle : function(C) {
				document.removeEvent("mousedown", this.fn);
				if (C.visible) {
					C.visible = false;
					C.button.removeClass(this.classes.active);
					this.fx.start(1, 0)
				} else {
					this.fn = function(I, H) {
						var I = new Event(I);
						var G = I.target;
						var F = false;
						while (G != document.body && G.nodeType == 1) {
							if (G == this.calendar) {
								F = true
							}
							this.calendars.each(function(J) {
								if (J.button == G || J.els.contains(G)) {
									F = true
								}
							});
							if (F) {
								I.stop();
								return false
							} else {
								G = G.parentNode
							}
						}
						this.toggle(H)
					}.create({
						"arguments" : C,
						bind : this,
						event : true
					});
					document.addEvent("mousedown", this.fn);
					this.calendars.each(function(F) {
						if (F == C) {
							F.visible = true;
							F.button.addClass(this.classes.active)
						} else {
							F.visible = false;
							F.button.removeClass(this.classes.active)
						}
					}, this);
					var B = window.getSize().scrollSize;
					var E = C.button.getCoordinates();
					var A = E.right + this.options.tweak.x;
					var D = E.top + this.options.tweak.y;
					if (!this.calendar.coord) {
						this.calendar.coord = this.calendar.getCoordinates()
					}
					if (A + this.calendar.coord.width > B.x) {
						A -= (A + this.calendar.coord.width - B.x)
					}
					if (D + this.calendar.coord.height > B.y) {
						D -= (D + this.calendar.coord.height - B.y)
					}
					this.calendar.setStyles({
						left : A + "px",
						top : D + "px"
					});
					if (window.ie6) {
						this.iframe.setStyles({
							height : this.calendar.coord.height + "px",
							left : A + "px",
							top : D + "px",
							width : this.calendar.coord.width + "px"
						})
					}
					this.display(C);
					this.fx.start(0, 1)
				}
			},
			unformat : function(B, G) {
				G = G.escapeRegExp();
				var I = {
					d : "([0-9]{2})",
					j : "([0-9]{1,2})",
					D : "(" + this.options.days.map(function(J) {
						return J.substr(0, 3)
					}).join("|") + ")",
					l : "(" + this.options.days.join("|") + ")",
					S : "(st|nd|rd|th)",
					F : "(" + this.options.months.join("|") + ")",
					m : "([0-9]{2})",
					M : "(" + this.options.months.map(function(J) {
						return J.substr(0, 3)
					}).join("|") + ")",
					n : "([0-9]{1,2})",
					Y : "([0-9]{4})",
					y : "([0-9]{2})"
				};
				var E = [];
				var F = "";
				for ( var C = 0; C < G.length; C++) {
					var H = G.charAt(C);
					if (I[H]) {
						E.push(H);
						F += I[H]
					} else {
						F += H
					}
				}
				var D = B.match("^" + F + "_");
				var A = new Array(3);
				if (D) {
					D = D.slice(1);
					E.each(function(K, J) {
						J = D[J];
						switch (K) {
						case "y":
							J = "19" + J;
						case "Y":
							A[0] = J.toInt();
							break;
						case "F":
							J = J.substr(0, 3);
						case "M":
							J = this.options.months.map(function(L) {
								return L.substr(0, 3)
							}).indexOf(J) + 1;
						case "m":
						case "n":
							A[1] = J.toInt() - 1;
							break;
						case "d":
						case "j":
							A[2] = J.toInt();
							break
						}
					}, this)
				}
				return A
			},
			value : function(B) {
				var A = null;
				if (B.val) {
					if (B.year == B.val.getFullYear()
							&& B.month == B.val.getMonth()) {
						A = B.val.getDate()
					}
				}
				return A
			},
			values : function(F) {
				var D, A, H;
				F.els.each(
						function(I) {
							if (I.getTag() == "select") {
								if (I.format.test("(y|Y)")) {
									D = [];
									I.getChildren().each(
											function(K) {
												var J = this.unformat(K.value,
														I.format);
												if (!D.contains(J[0])) {
													D.push(J[0])
												}
											}, this);
									D.sort(this.sort)
								}
								if (I.format.test("(F|m|M|n)")) {
									A = [];
									I.getChildren().each(
											function(K) {
												var J = this.unformat(K.value,
														I.format);
												if (_type(J[0]) != "number"
														|| J[0] == F.year) {
													if (!A.contains(J[1])) {
														A.push(J[1])
													}
												}
											}, this);
									A.sort(this.sort)
								}
								if (I.format.test("(d|j)")
										&& !I.format.test("^(d|j)_")) {
									H = [];
									I.getChildren().each(
											function(K) {
												var J = this.unformat(K.value,
														I.format);
												if (J[0] == F.year
														&& J[1] == F.month) {
													if (!H.contains(J[2])) {
														H.push(J[2])
													}
												}
											}, this)
								}
							}
						}, this);
				var G = 1;
				var E = new Date(F.year, F.month + 1, 0).getDate();
				if (F.year == F.start.getFullYear()) {
					if (A == null && this.options.navigation == 2) {
						A = [];
						for ( var C = 0; C < 12; C++) {
							if (C >= F.start.getMonth()) {
								A.push(C)
							}
						}
					}
					if (F.month == F.start.getMonth()) {
						G = F.start.getDate()
					}
				}
				if (F.year == F.end.getFullYear()) {
					if (A == null && this.options.navigation == 2) {
						A = [];
						for ( var C = 0; C < 12; C++) {
							if (C <= F.end.getMonth()) {
								A.push(C)
							}
						}
					}
					if (F.month == F.end.getMonth()) {
						E = F.end.getDate()
					}
				}
				var B = this.blocked(F);
				if (_type(H) == "array") {
					H = H.filter(function(I) {
						if (I >= G && I <= E && !B.contains(I)) {
							return I
						}
					}) 
				} else {
					H = [];
					for ( var C = G; C <= E; C++) {
						if (!B.contains(C)) {
							H.push(C)
						}
					}
				}
				H.sort(this.sort);
				return {
					days : H,
					months : A,
					years : D
				}
			},
			write : function(A) {
				this.rebuild(A);
				A.els.each(function(B) {
					B.value = this.format(A.val, B.format)
				}, this)
			}
		});
Calendar.implement(new Events, new Options);
