﻿$(document).ready(function () {
    $('#generateModal').modal({
        backdrop: 'static',
    });
    $('#generateModal').modal('hide');

    var generatePOTbl = $('#generatePoTable').DataTable({
        columns: [
            { title: "Item Code" },
            { title: "Description" },
            {
                title: "Quantity",
                render: function (data, type, row, meta) {
                    var html = '<input class="edit" type="number" ' +
                        'value="' + data + '"/>';
                    return html;
                } 
            },
            { title: "Unit Price" },
            { title: "Supplier" },
            { title: "Amount" },
            { defaultContent: '<i class="fa fa-times pointer" aria-hidden="true"></i>' }
        ],
        select: "api",
        dom: "t",
        autoWidth: true
       

    });

    var populate_dropbox = function (supplierList,id) {

        for (var supplier in supplierList) {
            if (supplierList.hasOwnProperty(supplier)) {
                var s = supplierList[supplier];
                var x = document.getElementById(id);
                var option = document.createElement("option");
                //alert(s.Name);
                option.text = s.Name;
                //alert(s.Priority);
                option.value = s.Priority;
                    x.add(option);
            }
        }

    }

    var addItemTable = $('#generateAddItem').DataTable({
        ajax: {
            url: "/api/manage/items",
            dataSrc: ""
        },
        pageLength: 5,
        columns: [
            { defaultContent: '<div class="thumbnail__small"></div>' },
            { data: "ItemCode" },
            { data: "ItemCategoryName"},
            { data: "Description"},
            { data: "Quantity" },
            { data: "ReorderLevel"},
            { data: "ReorderQuantity"},
            { data: "Uom" },
            { data: "UnitPrice"}
        ],
        select: "single",
        dom: "ftp"
    });

    $('#addItemButton').click(function () {

        document.getElementById("generateAmount").value = 0;
        document.getElementById("generateUnitPrice").value = 0;
        document.getElementById("generateQty").value = 0;

        $('#generateModal').modal({
            backdrop: 'static',
        });
    })

    //$('#saveAsBtn').click(function () {
    //    myTable.row.add([2, 3, 4]).draw();
    //})

    var i = 1;

    $('#addToPOBtn').click(function () {

        var data = $('#generateAddItem').DataTable().rows({ selected: true }).data().toArray();
        var itemNo = data[0].ItemCode;
        

        $.ajax({

            type: "POST",
            url: "/api/purchaseOrder/getsupplier",
            dataType: "json",
            data: { '': itemNo },
            contentType: 'application/x-www-form-urlencoded',
            cache: true,
            success: function (result) {
                
                var qty = parseInt($('#generateQty').val());
                var amount = parseInt($('#generateAmount').val());
                var id = "supervisor" + data[0].ItemCode; //i.toString();
                generatePOTbl.row.add([data[0].ItemCode, data[0].Description, qty, data[0].UnitPrice, '<select id="'+id+'"></select>', amount]).draw();
                document.getElementById("generateAmount").value = 0;
                document.getElementById("generateUnitPrice").value = 0;
                document.getElementById("generateQty").value = 0;
                populate_dropbox(result, id);
                document.getElementById(id).value = 1;
                i++;
                $('#generateModal').modal('hide');

            }
        });

        
        
    })

    $('#generatePoTable tbody').on('click', 'i.fa.fa-times', function () {
        generatePOTbl
            .row($(this).parents('tr'))
            .remove()
            .draw();
    });

    

    $('#generateAddItem tbody').on('click', 'tr', function () {
        var unitPrice = addItemTable.row(this).data().UnitPrice;
        
        document.getElementById("generateUnitPrice").value = unitPrice;
        document.getElementById("generateQty").value = 0;
        document.getElementById("generateAmount").value = 0;

    });

    $("#generateQty").change(function () {
        
        document.getElementById("generateAmount").value = document.getElementById("generateUnitPrice").value * document.getElementById("generateQty").value;
    });

    $("#generateUnitPrice").change(function () {
        
        document.getElementById("generateAmount").value = document.getElementById("generateUnitPrice").value * document.getElementById("generateQty").value;
    });

    $(document).on("change", ".edit", function () {

        var cell = generatePOTbl.cell(this.parentElement);
        // assign the cell with the value from the <input> element 
        cell.data($(this).val()).draw();
    });



    //SAVE
    $("#generateforms").click(function () {

        var datatableData = generatePOTbl.rows().data().toArray();

        //alert(datatableData);
        //alert(datatableData.length);
        var details = new Array();

        for (var i = 0; i < datatableData.length; i++) {

            var id = "#supervisor" + datatableData[i][0]; // (i + 1).toString();
            //alert(datatableData[i][2]);

            var o = {
                "ItemCode": datatableData[i][0],
                "Description": datatableData[i][1],
                "QuantityOrdered": datatableData[i][2],
                "UnitPrice": datatableData[i][3],
                "SupplierName": $(id).children("option").filter(":selected").text(),
                "SupplierPriority": $(id).children("option").filter(":selected").val(),
                "Amount": datatableData[i][5]
            };
            //alert(JSON.stringify(o));
            details.push(o);
        }

        $.ajax({

            type: "POST",
            url: "/purchaseOrder/save",
            dataType: "json",
            data: JSON.stringify(details),
            contentType: "application/json",
            cache: true,
            success: function (result) {

                alert("IN SUCCESS FUNCTION OF AJAX CALL TO POST THE PO DETAILS TO CONTROLLER TO SAVE");

                url = $("#successUrl").val();

                var form = document.createElement("form");
                var element1 = document.createElement("input");
                form.method = "POST";
                form.action = url;

                element1.value = result.purchaseOrders;
                element1.name = "purchaseOrderIds";
                element1.type = "hidden";
                form.appendChild(element1);

                document.body.appendChild(form);

                form.submit();

            }
            
        });

        
    });
        

    
    var PONums = $("#PONums").val();

    var successPOTable = $('#successPoTable').DataTable({

        ajax: {
            type: "POST",
            url: "/api/purchaseOrder/success",
            dataType: "json",
            data: { '': PONums },
            contentType: 'application/x-www-form-urlencoded',
            cache: true,
            dataSrc: ""
        },
        columns: [
            { data: "PurchaseOrderNo" },
            { data: "SupplierName" },
            { defaultContent: '<button id="infobutton" class="btn btn-default mb-3"><i class="fa fa-info-circle" aria-hidden="true"></i></button>' }
        ],
        dom: "t",
        select: "multiple"
    });




    

});
