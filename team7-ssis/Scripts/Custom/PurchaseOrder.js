$(document).ready(function(){
	
    var action_dropbox = function (data, type, row, meta) {
        if (data == "Delivered") {
            return '<select  class="action form-control form-control-sm"><option value="-1">Action</option><option value="0">View Purchase Order details</option> <option value=1>View Related Delivery Orders</option></select>';

        }
        else if (data == "Partially Delivered") {
            return '<select  class=" action form-control form-control-sm"><option value="-1">Action</option><option value="0">View Purchase Order details</option> <option value=1>View Related Delivery Orders</option><option value=2 > Receive Goods</ option></select>';
        }
        else {
            return '<select class="action form-control form-control-sm"><option value="-1">Action</option><option value="0">View Purchase Order details</option> <option value=2 > Receive Goods</ option></select>';
        }
        }
       
        
		var $table=$('#poTable');
	
		
		var datatbl = $table.DataTable(
            {
               
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search...",
                },
                ajax: {

                    url: "api/purchaseOrder/all",
                    dataSrc: ""    
                },
                
                columns: [
                    
                    {
                        data: "PurchaseOrderNo",
                        defaultContent: "<i>Not available</i>"
                    },
                    {
                        data: "SupplierName",
                        defaultContent: "<i>Not available</i>"
                    },
                    {
                        data: "CreatedDate",
                        defaultContent: "<i>Not available</i>"
                    },
                    {
                        data: "Status"  
                    },
                    {
                        data: "Status",
                        render: action_dropbox
                    }
                    
                ],
                autowidth: true,
                select: "single",

                createdRow: function (row, data, dataIndex) {
                    if (data.Status == "Delivered") {
                        $('td', row).eq(3).addClass('delivered');
                    }
                    if (data.Status == "Partially Delivered") {
                        $('td', row).eq(3).addClass('partially-delivered');
                    }
                    if (data.Status == "Awaiting Delivery") {
                        $('td', row).eq(3).addClass('awaiting-delivery');
                    }
                },

                initComplete: function (){ // After DataTable initialized
                    
                    this.api().columns([3]).every(function () {
                        var column = this;
                        var select = $('<select multiple id="sel1" title="All Statuses" data-width="auto" data-style="btn-sm" class=" selectpicker  " ></select>')
                            .prependTo($('.dataTables_filter')) 
                        var download = $('<a class=" btn  btn-primary pull-left mr-3 btn-sm btn" href="#"><i class="fa fa-download" ></i>  Download Selected</a>').prependTo($('#poTable_length'))
                        var select = $('#sel1').on('change', function () {
                           
                            var val = $(this).val() + '';
               

                            column.search(val != '' ? '^' + val.split(',').join('$|^') + '$' : '', true, false).draw();
                            });

                        column.data().unique().sort().each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        });
                        $('.selectpicker').selectpicker();  
                    }); // this.api function


                } //initComplete function 

               
        });


    $('#poTable tbody').on('change', '.action', function (e) {

        var poNum = datatbl.row($(this).parents('tr')).data().PurchaseOrderNo;
        
        var value = Number($(this).val());
        var url;

        if (value == 0) { url = $("#detailsUrl").val(); }
        else if (value == 1) { url = ''; }
        else if (value == 2) { url = ''; }
        else { url = ''; }

      

        var form = document.createElement("form");
        var element1 = document.createElement("input");
        form.method = "POST";
        form.action = url;

        element1.value = poNum;
        element1.name = "poNum";
        element1.type = "hidden";
        form.appendChild(element1);

        document.body.appendChild(form);

        form.submit();


    });


    var simple_cancel = function (data, type, row, meta) {
        var podStatus = $("#podStatus").val();
        var html = '<a class="cancelPODbtn btn-default btn disabled" ><i class="fa fa-close"></i></a>';

        if (podStatus == "Partially Delivered") {
            if (data == 0) {
                html = '<a id="cancelAwaiting" class="cancelPODbtn btn-default btn"  ><i class="fa fa-close"></i></a>';
            }
        }

        return html;
        
    };
   

    var podUrl = $("#purchaseOrderNo").val();

   
    //purchase order details table
    var $podtable = $('#poDetailTable');
    var poddatatbl = $podtable.DataTable(
        {
            dom: "t",
            ajax: {

                url: '/api/purchaseOrder/details/' + podUrl,
                dataSrc: ''
            },

            columns: [
                { data: "ItemCode" },
                {
                    data: "Description",
                    defaultContent: "<i>Not available</i>"
                },
                {
                    data: "QuantityOrdered",
                    defaultContent: "<i>Not available</i>"
                },
                {
                    data: "UnitPrice",
                    defaultContent: "<i>Not available</i>"
                },
                {
                    data: "Amount"
                },
                {
                    data: "ReceivedQuantity"
                },
                {
                    data: "RemainingQuantity"
                },
                {
                    data: "ReceivedQuantity",
                    render: simple_cancel
                }

            ],
            autowidth: true,
            select: "single"

        });



    //purchase order detail awaiting table

    var simple_textbox = function (data, type, row, meta) {
        if (data) {
            return '<input  type="text" class="qty" value="'+ data + '"/>';
        }
        
        return '';
       
    }

    var $podAwaitingtable = $('#poDetailAwaitingTable');
    var podAwaitingdatatbl = $podAwaitingtable.DataTable(
        {
            dom:"t",

            ajax: {

                url: '/api/purchaseOrder/details/' + podUrl,
                dataSrc: ''
            },

            columns: [
                { data: "ItemCode" },
                {
                    data: "Description",
                    defaultContent: "<i>Not available</i>"
                },
                {
                    data: "QuantityOrdered",
                    render: simple_textbox,
                    defaultContent: "<i>Not available</i>"
                },
                {
                    data: "UnitPrice"
                    
                },
                {
                    data: "Amount"
                },
                {
                    defaultContent: '<a class="deletebtn btn-default btn " href="#" ><i class="fa fa-close"></i></a>'  
                }
                
            ],
            autowidth: true,
            select: "single"

        });

    $('#poDetailAwaitingTable tbody').on('click', '.deletebtn', function (e){

        var itemCode = podAwaitingdatatbl.row($(this).parents('tr')).data().ItemCode;
        var pNum = $("#purchaseOrderNo").val();

        $.ajax({

            type: "POST",
            url: "/PurchaseOrder/delete",
            dataType: "json",
            data: JSON.stringify({ purchaseOrderNum: pNum, itemCode: itemCode}),
            contentType: "application/json",
            cache: true,
            success: function (data) {
                if (data.amount==0) {
                    window.location.reload();
                }
                document.getElementById("amountLabel").innerHTML = "$ " + data.amount;
                podAwaitingdatatbl.ajax.reload();
            }
    });
        
        
    });


    $('#cancel').on('click', function (e) {
        var pNum = $("#purchaseOrderNo").val();

        $.ajax({

            type: "POST",
            url: "/PurchaseOrder/cancel",
            dataType: "json",
            data: JSON.stringify({ purchaseOrderNum: pNum }),
            contentType: "application/json",
            cache: true,
            success: function (result) {
                if (result.status == "Cancelled") {
                    window.location.reload();
                }
                
            }
        });


    });


    $('#backBtn').on('click', function (e) {
        document.location.href = '/PurchaseOrder';
    });


    $('.savebutton').on('click', function (e) {

        alert("in save");

        var item = podAwaitingdatatbl.rows().data().toArray();

        var updateArr = new Array();

        for(i = 0; i < item.length;i++)
        {
            var o = {
               "ItemCode": item[i].ItemCode,
               "QuantityOrdered": item[i].QuantityOrdered,
                "PurchaseOrderNo": podUrl
            }

            updateArr.push(o);
            
        }

        $.ajax({

            type: "POST",
            url: "/purchaseOrder/update",
            dataType: "json",
            data: JSON.stringify(updateArr),
            contentType: "application/json",
            cache: true,
            success: function (result) {

                document.getElementById("amountLabel").innerHTML = "$ " + result.amount;
                //alert("Quantity has been updated!");
                podAwaitingdatatbl.ajax.reload();
                
            }
        });

    });


    $(document).on("change", ".qty", function () {

        var cell = podAwaitingdatatbl.cell(this.parentElement);
        // assign the cell with the value from the <input> element 
        cell.data($(this).val()).draw();
    });
   

      
   
   
    
                       
});
