﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace team7_ssis.Models
{
    public class DisbursementDetail
    {
        [Key]
        [Column(Order = 0)]
        [MaxLength(20)]
        public String DisbursementId { get; set; }
        [Key]
        [MaxLength(4)]
        [Column(Order = 1)]
        public string ItemCode { get; set; }
        [ForeignKey("DisbursementId")]
        public virtual Disbursement Disbursement { get; set; }
        [ForeignKey("ItemCode")]
        public virtual Item Item { get; set; }
        [MaxLength(8)]
        public string Bin { get; set; }
        public int PlanQuantity { get; set; }
        public int ActualQuantity { get; set; }
        public virtual Status Status { get; set; }
        public virtual ApplicationUser UpdatedBy { get; set; }
        public DateTime? UpdatedDateTime { get; set; }
        [InverseProperty("DisbursementDetail")]
        public virtual List<StockMovement> StockMovements { get; set; }
    }
}