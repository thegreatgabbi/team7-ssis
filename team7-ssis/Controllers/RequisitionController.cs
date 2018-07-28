﻿using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using team7_ssis.Models;
using team7_ssis.Repositories;
using team7_ssis.Services;
using team7_ssis.ViewModels;

namespace team7_ssis.Controllers
{
    public class RequisitionController : Controller
    {
        private ApplicationDbContext context;
        private RequisitionService requisitionService;
        private RequisitionRepository requisitionRepository;
        private RetrievalService retrievalService;
        private ItemService itemService;
        private CollectionPointService collectionPointService;
        private DepartmentService departmentService;
        private UserManager<ApplicationUser> userManager;

        public RequisitionController()
        {
            context = new ApplicationDbContext();
            requisitionService = new RequisitionService(context);
            requisitionRepository = new RequisitionRepository(context);
            retrievalService = new RetrievalService(context);
            itemService = new ItemService(context);
            collectionPointService = new CollectionPointService(context);
            departmentService = new DepartmentService(context);
            userManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(context));
        }

        // GET: /Requisition
        public ActionResult ManageRequisitions()
        {
            return View();
        }

        // GET: /Requisiton/RequisitionDetails
        public ActionResult RequisitionDetails(string rid)
        {
            Requisition r = requisitionRepository.FindById(rid);
            RequisitionDetailViewModel viewModel = new RequisitionDetailViewModel();
            try {
                viewModel.RequisitionID = r.RequisitionId;
                viewModel.Department = r.Department == null ? "" : r.Department.Name;
                viewModel.CollectionPoint = r.CollectionPoint == null ? "" : r.CollectionPoint.Name;
                viewModel.CreatedBy = r.CreatedBy == null ? "" : String.Format("{0} {1}", r.CreatedBy.FirstName, r.CreatedBy.LastName);
                viewModel.CreatedTime = String.Format("{0} {1}", r.CreatedDateTime.ToShortDateString(), r.CreatedDateTime.ToShortTimeString());
                viewModel.UpdatedBy = r.UpdatedBy == null ? "" : String.Format("{0} {1}", r.UpdatedBy.FirstName, r.UpdatedBy.LastName);
                viewModel.UpdatedTime = r.UpdatedDateTime == null ? "" : String.Format("{0} {1}", r.UpdatedDateTime.Value.ToShortDateString(), r.UpdatedDateTime.Value.ToShortTimeString());
                viewModel.ApprovedBy = r.ApprovedBy == null ? "" : String.Format("{0} {1}", r.ApprovedBy.FirstName, r.ApprovedBy.LastName);
                viewModel.ApprovedTime = r.ApprovedDateTime == null ? "" : String.Format("{0} {1}", r.ApprovedDateTime.Value.ToShortDateString(), r.ApprovedDateTime.Value.ToShortTimeString());
            } catch {
                return new HttpStatusCodeResult(400);
            }
            return View(viewModel);
        }
        // GET: /Requisiton/StationeryRetrieval
        [Route("/Requisition/StationeryRetrieval")]
        public ActionResult StationeryRetrieval(string rid)
        {
            Retrieval r = retrievalService.FindRetrievalById(rid);
            StationeryRetrievalViewModel viewModel = new StationeryRetrievalViewModel();

            try
            {
                viewModel.RetrievalID = r.RetrievalId;

                try { viewModel.CreatedBy = String.Format("{0} {1}", r.CreatedBy.FirstName, r.CreatedBy.LastName); }
                catch { viewModel.CreatedBy = ""; }
                viewModel.CreatedOn = String.Format("{0} {1}", r.CreatedDateTime.ToShortDateString(), r.CreatedDateTime.ToShortTimeString());
                try
                {
                    viewModel.UpdatedBy = String.Format("{0} {1}", r.UpdatedBy.FirstName, r.UpdatedBy.LastName);
                }
                catch
                {
                    viewModel.UpdatedBy = "";
                }
                try
                {
                    viewModel.UpdatedOn = String.Format("{0} {1}", r.UpdatedDateTime.Value.ToShortDateString(), r.UpdatedDateTime.Value.ToShortTimeString());
                }
                catch
                {
                    viewModel.UpdatedOn = "";
                }
            } catch {
                return new HttpStatusCodeResult(400);
            }
            return View(viewModel);
        }
        // GET: /Requisiton/StationeryDisbursement
        public ActionResult StationeryDisbursement(string rid)
        {
            ViewBag.RetrievalID = rid;
            return View();
        }

        // GET: /Requisiton/CreateRequisition
        public ActionResult CreateRequisition()
        {
            CreateRequisitionViewModel viewModel = CreateReqViewModel("Create");
            return View("../Requisition/CreateEditRequisition", viewModel);
        }

        // GET: /Requisiton/EditRequisition
        public ActionResult EditRequisition()
        {
            CreateRequisitionViewModel viewModel = CreateReqViewModel("Edit");
            return View("../Requisition/CreateEditRequisition", viewModel);
        }

        private CreateRequisitionViewModel CreateReqViewModel(string action)
        {
            CreateRequisitionViewModel viewModel = new CreateRequisitionViewModel();
            viewModel.Action = action;
            try
            {
                viewModel.Representative = departmentService.FindDepartmentByUser(userManager.FindById(User.Identity.GetUserId())).ContactName;
            }
            catch
            {
                viewModel.Representative = "";
            }
            viewModel.SelectCollectionPointList = collectionPointService.FindAllCollectionPoints();
            return viewModel;
        }
    }
}