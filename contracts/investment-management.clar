;; Investment Management Contract
;; Tracks capital contributions and ownership

(define-data-var contract-owner principal tx-sender)

;; Data structure for investments
(define-map investments
  { project-id: uint, investor: principal }
  {
    amount: uint,
    ownership-percentage: uint,  ;; Represented as basis points (1/100 of a percent)
    timestamp: uint
  }
)

;; Total investment per project
(define-map project-investments
  { project-id: uint }
  {
    total-investment: uint,
    investor-count: uint
  }
)

;; Make an investment in a project
(define-public (invest (project-id uint) (amount uint))
  (let
    (
      (project-data (default-to { total-investment: u0, investor-count: u0 }
                     (map-get? project-investments { project-id: project-id })))
      (new-total (+ (get total-investment project-data) amount))
      (existing-investment (map-get? investments { project-id: project-id, investor: tx-sender }))
      (new-investor-count (if (is-some existing-investment)
                             (get investor-count project-data)
                             (+ (get investor-count project-data) u1)))
    )
    (begin
      ;; Call to project verification contract would go here in a real implementation
      ;; to check if project is verified and active

      ;; Update total investment for project
      (map-set project-investments
        { project-id: project-id }
        {
          total-investment: new-total,
          investor-count: new-investor-count
        }
      )

      ;; Calculate ownership percentage (in basis points)
      (let
        (
          (ownership-basis-points (/ (* amount u10000) new-total))
          (current-investment (default-to { amount: u0, ownership-percentage: u0, timestamp: u0 }
                              existing-investment))
          (new-amount (+ (get amount current-investment) amount))
          (new-ownership (/ (* new-amount u10000) new-total))
        )
        (map-set investments
          { project-id: project-id, investor: tx-sender }
          {
            amount: new-amount,
            ownership-percentage: new-ownership,
            timestamp: block-height
          }
        )
        (ok new-ownership)
      )
    )
  )
)

;; Get investment details
(define-read-only (get-investment (project-id uint) (investor principal))
  (map-get? investments { project-id: project-id, investor: investor })
)

;; Get total investment for a project
(define-read-only (get-project-investment (project-id uint))
  (map-get? project-investments { project-id: project-id })
)

;; Initialize contract
(begin
  (var-set contract-owner tx-sender)
)
