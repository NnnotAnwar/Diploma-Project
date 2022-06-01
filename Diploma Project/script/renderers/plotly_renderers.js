(function () {
  let callWithJQuery;

  callWithJQuery = function (pivotModule) {
    if (typeof exports === "object" && typeof module === "object") {
      return pivotModule(require("jquery"), require("plotly.js"));
    } else if (typeof define === "function" && define.amd) {
      return define(["jquery", "plotly.js"], pivotModule);
    } else {
      return pivotModule(jQuery, Plotly);
    }
  };

  callWithJQuery(function ($, Plotly) {
    let makePlotlyChart, makePlotlyScatterChart, makePlotlySankeyChart, makePlotlySankeyFlowChart;
    makePlotlyChart = function (traceOptions, layoutOptions, transpose) {
      if (traceOptions == null) {
        traceOptions = {};
      }
      if (layoutOptions == null) {
        layoutOptions = {};
      }
      if (transpose == null) {
        transpose = false;
      }
      return function (pivotData, opts) {
        let colKeys, columns, d, data, datumKeys, defaults, fullAggName, groupByTitle, hAxisTitle, i, layout, result, rowKeys, rows, titleText, traceKeys;
        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: {
            toImageButtonOptions: {
              format: 'png', // one of png, svg, jpeg, webp
              filename: 'Diagram',
              scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            },
            modeBarButtonsToRemove: ['lasso', 'select'],
            displaylogo: false
          }
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        traceKeys = transpose ? colKeys : rowKeys;
        if (traceKeys.length === 0) {
          traceKeys.push([]);
        }
        datumKeys = transpose ? rowKeys : colKeys;
        if (datumKeys.length === 0) {
          datumKeys.push([]);
        }
        fullAggName = pivotData.aggregatorName;
        if (pivotData.valAttrs.length) {
          fullAggName += "(" + (pivotData.valAttrs.join(", ")) + ")";
        }
        data = traceKeys.map(function (traceKey) {
          let datumKey, j, labels, len, trace, val, values;
          values = [];
          labels = [];
          for (j = 0, len = datumKeys.length; j < len; j++) {
            datumKey = datumKeys[j];
            val = parseFloat(pivotData.getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey).value());
            values.push(isFinite(val) ? val : null);
            labels.push(datumKey.join('-') || ' ');
          }
          trace = {
            name: traceKey.join('-') || fullAggName
          };
          if (traceOptions.type === "pie") {
            trace.values = values;
            trace.labels = labels.length > 1 ? labels : [fullAggName];
          } else {
            trace.x = transpose ? values : labels;
            trace.y = transpose ? labels : values;
          }
          return $.extend(trace, traceOptions);
        });
        if (transpose) {
          hAxisTitle = pivotData.rowAttrs.join("-");
          groupByTitle = pivotData.colAttrs.join("-");
        } else {
          hAxisTitle = pivotData.colAttrs.join("-");
          groupByTitle = pivotData.rowAttrs.join("-");
        }
        titleText = fullAggName;
        if (hAxisTitle !== "") {
          titleText += " " + opts.localeStrings.vs + " " + hAxisTitle;
        }
        if (groupByTitle !== "") {
          titleText += " " + opts.localeStrings.by + " " + groupByTitle;
        }
        layout = {
          title: titleText,
          hovermode: 'closest',
          width: 820,
          height: 520
        };
        if (traceOptions.type === 'pie') {
          columns = Math.ceil(Math.sqrt(data.length));
          rows = Math.ceil(data.length / columns);
          layout.grid = {
            columns: columns,
            rows: rows
          };
          for (i in data) {
            d = data[i];
            d.domain = {
              row: Math.floor(i / columns),
              column: i - columns * Math.floor(i / columns)
            };
            if (data.length > 1) {
              d.title = d.name;
            }
          }
          if (data[0].labels.length === 1) {
            layout.showlegend = false;
          }
        } else {
          layout.xaxis = {
            title: transpose ? fullAggName : null,
            automargin: true
          };
          layout.yaxis = {
            title: transpose ? null : fullAggName,
            automargin: true
          };
        }
        result = $("<div>").appendTo($("body"));
        Plotly.newPlot(result[0], data, $.extend(layout, layoutOptions, opts.plotly), opts.plotlyConfig);
        return result.detach();
      };
    };
    makePlotlyScatterChart = function () {
      return function (pivotData, opts) {
        let colKey, colKeys, data, defaults, j, k, layout, len, len1, renderArea, result, rowKey, rowKeys, v;
        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: {
            toImageButtonOptions: {
              format: 'png', // one of png, svg, jpeg, webp
              filename: 'Diagram',
              scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            },
            modeBarButtonsToRemove: ['lasso', 'select'],
            displaylogo: false
          }
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        }
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        }
        data = {
          x: [],
          y: [],
          text: [],
          type: 'scatter',
          mode: 'markers'
        };
        for (j = 0, len = rowKeys.length; j < len; j++) {
          rowKey = rowKeys[j];
          for (k = 0, len1 = colKeys.length; k < len1; k++) {
            colKey = colKeys[k];
            v = pivotData.getAggregator(rowKey, colKey).value();
            if (v != null) {
              data.x.push(colKey.join('-'));
              data.y.push(rowKey.join('-'));
              data.text.push(v);
            }
          }
        }
        layout = {
          title: pivotData.rowAttrs.join("-") + ' vs ' + pivotData.colAttrs.join("-"),
          hovermode: 'closest',
          xaxis: {
            title: pivotData.colAttrs.join('-'),
            automargin: true
          },
          yaxis: {
            title: pivotData.rowAttrs.join('-'),
            automargin: true
          },
          width: 820,
          height: 520
        };
        renderArea = $("<div>", {
          style: "display:none;"
        }).appendTo($("body"));
        result = $("<div>").appendTo(renderArea);
        Plotly.newPlot(result[0], [data], $.extend(layout, opts.plotly), opts.plotlyConfig);
        result.detach();
        renderArea.remove();
        return result;
      };
    };
    makePlotlySankeyChart = function () {
      return function (pivotData, opts) {
        let defaults, rowKeys, colKeys, label, value, target, link, layout, title, uptRowKeys, uptColKeys, labelKeys, sankey, coupleArray, couple, coupleData;

        uptRowKeys = {}; uptColKeys = {};

        defaults = {
          localeStrings: {
            vs: "vs",
            by: "by"
          },
          plotly: {},
          plotlyConfig: {
            toImageButtonOptions: {
              format: 'png', // one of png, svg, jpeg, webp
              filename: 'Sankey_Flow',
              scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            },
            modeBarButtonsToRemove: ['lasso', 'select'],
            displaylogo: false
          }
        }

        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        };
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        };

        for (const rowKey of rowKeys) {
          for (const key of rowKey) {
            uptRowKeys[key] = true;
          }
        }

        for (const colKey of colKeys) {
          for (const key of colKey) {
            uptColKeys[key] = true;
          }
        }

        labelKeys = Object.assign({}, uptRowKeys, uptColKeys)

        label = Object.keys(labelKeys);
        uptRowKeys = Object.keys(uptRowKeys);
        uptColKeys = Object.keys(uptColKeys);
        source = [];
        target = [];
        value = [];
        coupleArray = [];
        couple = [];
        coupleData = [];

        // rowKeys.forEach((element, index, array) => {
        //     for (let i in colKeys) {
        //       source.push(+index);
        //       target.push(+i + array.length);
        //       value.push(pivotData.getAggregator(element, colKeys[i]).value());
        //     }
        // })
        for (let rowKey of rowKeys) {
          for (let colKey of colKeys) {

            // for (let index in rowKey) {
            // couple.push(rowKey[index]);
            // };
            // for (let colItem of colKey) {
            //   couple.push(colItem);
            // };

            couple.push(...rowKey, ...colKey)

            for (item of couple) {
              labelKeys[`${item}`] = true;
            };

            value.push(pivotData.getAggregator(rowKey, colKey).value());
            coupleArray.push(couple);
            couple = [];

          };
        };

        // for (let index = 0; index < coupleArray.length; index++) {
        //   let item = coupleArray[index];
        //   let val = value[index];
        //   for (let index = 0; index < item.length; index++) {
        //     let itemData = item.slice(index, index + 2);
        //     if (itemData.length == 2) {
        //       itemData.push(val);
        //       coupleData.push(itemData);
        //     };
        //   };
        // };

        coupleArray.forEach((element, index, array) => {
          let val = value[index];
          element.forEach((item, i, arr) => {
            let itemData = arr.slice(i, i + 2);
            if (itemData.length == 2) {
              itemData.push(val);
              coupleData.push(itemData);
            };
          })
        }
        );

        value = [];

        // stackoverflow moment ^-^
        const values = {};
        const separator = '=>';
        coupleData.forEach(item => {
          const key = item[0] + separator + item[1];
          if (values[key] === undefined) {
            values[key] = item[2];
            return;
          };
          values[key] += item[2];
        });
        coupleData = Object.entries(values).map(item => {
          const s = item[0].split(separator);
          return [...s, item[1]];
        });

        // ^-^

        for (let item of coupleData) {
          let slicedData = item.slice(0, 2);
          source.push(label.indexOf(slicedData[0]));
          target.push(label.indexOf(slicedData[1]));
          value.push(item[2]);
        };

        sankey = {
          orientation: "h",
          node: {
            pad: 15,
            thickness: 30,
            line: {
              color: "black",
              width: 0.5
            },
            label: label, // элементы (Male, Conservative, Quentin, 20)
          },
          link: {
            source: source, // фром(индекс элемента)
            target: target, // ту(индекс элемента)
            value: value   // валью(значение аггрегатора)
          },

          xaxis: `x`,
          yaxis: `y`,

          type: 'sankey',
        };

        layout = {
          title: pivotData.aggregatorName + ' vs ' + pivotData.rowAttrs.join("-") + ' by ' + pivotData.colAttrs.join("-"),
          hovermode: 'closest',
          width: 820,
          height: 520,
        };

        renderArea = $("<div>", {
          style: "display:none;"
        }).appendTo($("body"));

        result = $("<div>").appendTo(renderArea);
        Plotly.newPlot(result[0], [sankey], $.extend(layout, opts.plotly), opts.plotlyConfig);
        result.detach();
        renderArea.remove();
        return result;
      }
    };
    makeTSVExport = function () {
      return function (pivotData, opts) {
        var agg, colAttrs, colKey, colKeys, defaults, i, j, k, l, len, len1, len2, len3, len4, len5, m, n, r, result, row, rowAttr, rowAttrs, rowKey, rowKeys, text;
        defaults = {
          localeStrings: {}
        };
        opts = $.extend(true, {}, defaults, opts);
        rowKeys = pivotData.getRowKeys();
        if (rowKeys.length === 0) {
          rowKeys.push([]);
        }
        colKeys = pivotData.getColKeys();
        if (colKeys.length === 0) {
          colKeys.push([]);
        }
        rowAttrs = pivotData.rowAttrs;
        colAttrs = pivotData.colAttrs;
        result = [];
        row = [];
        for (i = 0, len = rowAttrs.length; i < len; i++) {
          rowAttr = rowAttrs[i];
          row.push(rowAttr);
        }
        if (colKeys.length === 1 && colKeys[0].length === 0) {
          row.push(pivotData.aggregatorName);
        } else {
          for (j = 0, len1 = colKeys.length; j < len1; j++) {
            colKey = colKeys[j];
            row.push(colKey.join("-"));
          }
        }
        result.push(row);
        for (k = 0, len2 = rowKeys.length; k < len2; k++) {
          rowKey = rowKeys[k];
          row = [];
          for (l = 0, len3 = rowKey.length; l < len3; l++) {
            r = rowKey[l];
            row.push(r);
          }
          for (m = 0, len4 = colKeys.length; m < len4; m++) {
            colKey = colKeys[m];
            agg = pivotData.getAggregator(rowKey, colKey);
            if (agg.value() != null) {
              row.push(agg.value());
            } else {
              row.push("");
            }
          }
          result.push(row);
        }
        text = "";
        for (n = 0, len5 = result.length; n < len5; n++) {
          r = result[n];
          text += r.join("\t") + "\n";
        }
        return $("<textarea>").text(text).css({
          width: ($(window).width() / 2) + "px",
          height: ($(window).height() / 2) + "px"
        });
      }
    }
    return $.pivotUtilities.plotly_renderers = {
      "Horizontal Bar Chart": makePlotlyChart({
        type: 'bar',
        orientation: 'h'
      }, {
        barmode: 'group'
      }, true),
      "Horizontal Stacked Bar Chart": makePlotlyChart({
        type: 'bar',
        orientation: 'h'
      }, {
        barmode: 'relative'
      }, true),
      "Bar Chart": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'group'
      }),
      "Stacked Bar Chart": makePlotlyChart({
        type: 'bar'
      }, {
        barmode: 'relative'
      }),
      "Sankey Chart": makePlotlySankeyChart(),
      "Line Chart": makePlotlyChart(),
      "Area Chart": makePlotlyChart({
        stackgroup: 1
      }),
      "Scatter Chart": makePlotlyScatterChart(),
      'Multiple Pie Chart': makePlotlyChart({
        type: 'pie',
        scalegroup: 1,
        hoverinfo: 'label+value',
        textinfo: 'none'
      }, {}, true),
      'TSV Export': makeTSVExport()
    };
  });

}).call(this);

//# sourceMappingURL=plotly_renderers.js.map
