﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using team7_ssis.Models;
using team7_ssis.ViewModels;
using team7_ssis.Services;
using Microsoft.AspNet.Identity;


namespace team7_ssis.Controllers
{ 
    public class PurchaseOrderController : Controller
    {
        private ApplicationDbContext context;
        private PurchaseOrderService purchaseOrderService;
        private StatusService statusService;
        private ItemService itemService;
        private UserService userService;
        private ItemPriceService itemPriceService;
        

        public PurchaseOrderController()
        {
            context = new ApplicationDbContext();
            purchaseOrderService = new PurchaseOrderService(context);
            statusService = new StatusService(context);
            itemService = new ItemService(context);
            itemPriceService = new ItemPriceService(context);
            userService = new UserService(context);
        }

        public ActionResult Index()
        {
            return View("Manage");
        }


        [HttpPost]
        public ActionResult Details(string poNum)
        {
            if (poNum != null && poNum != "")
            {
                PurchaseOrder po = purchaseOrderService.FindPurchaseOrderById(poNum);
                PurchaseOrderViewModel podModel = new PurchaseOrderViewModel();
                decimal totalAmount = 0;

            
                podModel.PurchaseOrderNo = po.PurchaseOrderNo;
                podModel.SupplierName = po.Supplier.Name;
                podModel.CreatedDate = po.CreatedDateTime.ToShortDateString() + " " + po.CreatedDateTime.ToShortTimeString();
                podModel.Status = po.Status.Name;

                foreach (PurchaseOrderDetail pod in po.PurchaseOrderDetails)
                {
                    totalAmount = totalAmount + purchaseOrderService.FindTotalAmountByPurchaseOrderDetail(pod);
                }
                ViewBag.Amount = totalAmount;

                return View(podModel);
            }

            else
            {
                ViewBag.Message = "Purchase Order is not a valid one. Please try again!";
                return View("Error");
            }
            

        }

        [HttpPost]
        public ActionResult Update(List<PurchaseOrderDetailsViewModel> updateValues)
        {
            decimal totalAmount = 0;
            string purchaseOrderNo = updateValues[0].PurchaseOrderNo;

            PurchaseOrder purchaseOrder = purchaseOrderService.FindPurchaseOrderById(purchaseOrderNo);

            foreach (PurchaseOrderDetailsViewModel podViewModel in updateValues)
            {
                foreach (PurchaseOrderDetail pod in purchaseOrder.PurchaseOrderDetails)
                {
                    if (podViewModel.ItemCode == pod.ItemCode)
                    {
                        pod.Quantity = podViewModel.QuantityOrdered;
                        purchaseOrderService.Save(purchaseOrder);
                        break;
                    }
                }

            }

            

            foreach (PurchaseOrderDetail pod in purchaseOrder.PurchaseOrderDetails)
            {
                totalAmount = totalAmount + purchaseOrderService.FindTotalAmountByPurchaseOrderDetail(pod);
            }

            return new JsonResult { Data = new { amount = totalAmount } };
        
        }


        [HttpPost]
        public ActionResult Delete(string purchaseOrderNum, string itemCode)
        {
            decimal totalAmount=0;

            string[] itemCodeArray = new string[] { itemCode };

            PurchaseOrder purchaseOrder = purchaseOrderService.FindPurchaseOrderById(purchaseOrderNum);

            purchaseOrderService.DeleteItemFromPurchaseOrder(purchaseOrder,itemCodeArray);

            if (purchaseOrder.PurchaseOrderDetails.Count == 0)
            {
                purchaseOrder.Status = statusService.FindStatusByStatusId(2);
                purchaseOrder.Status.StatusId = 2;
                purchaseOrderService.Save(purchaseOrder);
            }
            else

            {
                foreach (PurchaseOrderDetail pod in purchaseOrder.PurchaseOrderDetails)
                {
                    totalAmount = totalAmount + purchaseOrderService.FindTotalAmountByPurchaseOrderDetail(pod);
                }
            }
            
            

            return new JsonResult { Data = new { amount = totalAmount } };
        }


        [HttpPost]
        public ActionResult Cancel(string purchaseOrderNum)
        {
            PurchaseOrder purchaseOrder = purchaseOrderService.FindPurchaseOrderById(purchaseOrderNum);
            purchaseOrder.Status = statusService.FindStatusByStatusId(2);
            purchaseOrderService.Save(purchaseOrder);

            return new JsonResult { Data = new { status = "Cancelled" } };
        }

        public ActionResult Generate()
        {
            return View();
        }




        [HttpPost]
        public ActionResult Save(List<PurchaseOrderDetailsViewModel> purchaseOrderDetailList)
        {
            List<Supplier> supList = new List<Supplier>();
            foreach(PurchaseOrderDetailsViewModel pod in purchaseOrderDetailList)
            {
                Item item=itemService.FindItemByItemCode(pod.ItemCode);
                ItemPrice itemPrice= itemPriceService.FindSingleItemPriceByPriority(item, pod.SupplierPriority);

                if (!supList.Contains(itemPrice.Supplier))
                {
                    supList.Add(itemPrice.Supplier);
                }  
            }


            List<PurchaseOrder> poList = purchaseOrderService.CreatePOForEachSupplier(supList);


            List<string> purchaseOrderIds = new List<string>();
            foreach(PurchaseOrder pOrder in poList)
            {
                pOrder.CreatedBy= userService.FindUserByEmail(System.Web.HttpContext.Current.User.Identity.GetUserName());
                pOrder.PurchaseOrderDetails = new List<PurchaseOrderDetail>();
                purchaseOrderService.Save(pOrder);
                purchaseOrderIds.Add(pOrder.PurchaseOrderNo);
            }
            
            foreach (PurchaseOrderDetailsViewModel pod in purchaseOrderDetailList)
            {
                PurchaseOrderDetail poDetail = new PurchaseOrderDetail();
                poDetail.Item = itemService.FindItemByItemCode(pod.ItemCode);
                poDetail.ItemCode = pod.ItemCode;
                poDetail.Quantity = pod.QuantityOrdered;
                poDetail.Status = statusService.FindStatusByStatusId(11);
                poDetail.Status.StatusId = 11;
                //poDetail.UpdatedDateTime = DateTime.Now;
               // poDetail.UpdatedBy = userService.FindUserByEmail(System.Web.HttpContext.Current.User.Identity.GetUserName());
                
                foreach(PurchaseOrder po in poList)
                {
                    
                    Item item = itemService.FindItemByItemCode(pod.ItemCode);
                    ItemPrice itemPrice = itemPriceService.FindSingleItemPriceByPriority(item, pod.SupplierPriority);
                    if (itemPrice.SupplierCode == po.SupplierCode)
                    {
                        poDetail.PurchaseOrder = po; 
                        po.PurchaseOrderDetails.Add(poDetail);

                        purchaseOrderService.Save(po);
                        break;
                    }
                }

                purchaseOrderService.SavePurchaseOrderDetail(poDetail);
                
            }

            return new JsonResult { Data = new { purchaseOrders = purchaseOrderIds } };


        }

        

        [HttpPost]
        public ActionResult Success(string purchaseOrderIds)
        {
            if(purchaseOrderIds==null || purchaseOrderIds == "")
            {
                ViewBag.Message = "This page has expired!. Please return to Manage Purchase Orders to view all purchase orders created!";
            }
            ViewBag.poNums = purchaseOrderIds;
            return View();
        }

    }

   

}