     var mesesAnio = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
     var files = ["2017.csv", "2016.csv", "2015.csv", "2014.csv", "2013.csv", "2012.csv", "2011.csv", "2010.csv", "2009.csv", "2008.csv", "2007.csv"]
     var datos = []
     var myTimeParse = d3.timeParse("%d/%m/%Y");
     var indice
     var t = d3.transition()
         .duration(500)
         .ease(d3.easeLinear);
     var escalaColor = d3.scaleLinear()
         .domain([0, 2, 5, 7, 10])
         .range(["#fff", "#E4FD08", "#3AF860", "#16F3FA", "#F62DBE"]);

     $("input").change(function () {
         if ($(this).prop("checked")) {
             d3.selectAll("[valor1='#cont2" + $(this).val() + "']").transition(t).style("opacity", 1).transition()
         } else {
             d3.selectAll("[valor1='#cont2" + $(this).val() + "']").transition(t).style("opacity", 0).transition()
         }
     })

     $("button").click(function () {
         for (var i = 0; i < datos.length; i++) {
             $("input").prop("checked", false);
             d3.selectAll("[valor1='#cont2" + i + "']").transition(t).style("opacity", 0).transition();
         }

     });

     Promise.all(files.map(url => d3.text(url))).then(function (values) {
         for (var i = 0; i < values.length; i++) {
             datos.push(d3.csvParseRows(values[i], function (d) {
                 if (myTimeParse(d[0]) != null) {
                     if (!isNaN(d[1])) {
                         return {
                             fecha: new Date(myTimeParse(d[0])),
                             temperatura: parseFloat(d[1])
                         }
                     }
                 }
             }))
         }
         datos = datos.sort(function (x, y) {
             return d3.ascending(x.fecha, y.fecha);
         })
         pintaPolar("#cont1");
         pintaPolar("#cont2");
         d3.selectAll("[valor1='#cont20']").style("opacity", 1).transition()
         d3.selectAll("[valor1='#cont210']").style("opacity", 1).transition()
         intervalo()
     });

     function pintaPolar(selector) {
         var width = 450,
             height = 450,
             radius = Math.min(width, height) / 2 - 50;

         var r = d3.scaleLinear()
             .domain([0, 40])
             .range([0, radius]);

         var lineFunctionRad = d3.lineRadial()
             .angle(function (d) {
                 var anio = new Date(d.fecha.getFullYear().toString())
                 var nuevoAnio = new Date((parseInt(d.fecha.getFullYear()) + 1).toString())
                 var incremento = (d.fecha - anio) / (nuevoAnio - anio)
                 return incremento * 2 * Math.PI;
             })
             .radius(function (d) {
                 return r(d.temperatura + 10);
             })
             .curve(d3.curveLinear)


         var svg = d3.select(selector).append("svg")
             .attr("width", width)
             .attr("height", height)
             .append("g")
             .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


         for (var i = 0; i < datos.length; i++) {
             svg.append("path")
                 .attr("valor1", selector + i)
                 .datum(datos[i])
                 .style("fill", "none")
                 .attr("stroke", escalaColor(i))
                 .style("opacity", 0)
                 .attr("d", lineFunctionRad)
             d3.selectAll("#lab" + i).style("color", escalaColor(i))
         }

         var gr = svg.append("g")
             .attr("class", "r axis")
             .selectAll("g")
             //.data(r.ticks(5).slice(1))
             .data(r.ticks(5))
             .enter().append("g");

         gr.append("circle")
             .attr("r", r);

         gr.append("text")
             .attr("y", function (d) {
                 return -r(d) - 4;
             })
             .attr("transform", "rotate(15)")
             .attr("fill", "#fff")
             .style("text-anchor", "middle")
             .text(function (d) {
                 return (d - 10).toString();
                 //return d
             });

         var ga = svg.append("g")
             .attr("class", "a axis")
             .selectAll("g")
             .data(d3.range(0, 360, 30))
             .enter().append("g")
             .attr("transform", function (d) {
                 return "rotate(" + (+d - 90) + ")";
             });;

         ga.append("line")
             .attr("x2", radius);

         ga.append("text")
             .attr("x", radius + 6)
             .attr("dy", ".35em")
             .attr("fill", "#ccccff")
             .style("text-anchor", function (d) {
                 return d > 180 ? "end" : null;
             })
             .attr("transform", function (d) {
                 return d > 180 ? "rotate(180 " + (radius + 6) + ",0)" : null;
             })
             .text(function (d) {
                 return mesesAnio[d / 30];
             });
     }

     function intervalo() {
         indice = 0
         d3.select("#id1 h2").style("color", "#eeeeff").style("font-size", "40px").text("2007")

         d3.selectAll("[valor1='#cont1" + indice + "']").style("opacity", 1).attr("stroke", "#ccffff")
         for (var i = 0; i < datos.length; i++) {
             if (i != indice)
                 d3.selectAll("[valor1='#cont1" + i + "']").style("opacity", 0.15).attr("stroke", "#999")
         }

         setInterval(function () {
             var t2 = d3.transition()
                 .duration(500)
                 .ease(d3.easeLinear);
             indice++

             if (indice > datos.length - 1) {
                 indice = 0
             }

             d3.selectAll("#id1 h2").text(2007 + indice)

             d3.selectAll("[valor1='#cont1" + indice + "']").transition(t2).style("opacity", 1).attr("stroke", "#ccffff").transition()
             for (var i = 0; i < datos.length; i++) {
                 if (i != indice)
                     d3.selectAll("[valor1='#cont1" + i + "']").transition(t2).style("opacity", 0.15).attr("stroke", "#999").transition()

             }

         }, 2000);
     }
