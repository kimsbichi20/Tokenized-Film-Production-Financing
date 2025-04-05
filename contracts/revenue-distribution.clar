;; Revenue Distribution Contract
;; Allocates income from completed films

(define-data-var contract-owner principal tx-sender)

;; Data structure for revenue
(define-map project-revenue
  { project-id: uint }
  {
    total-revenue: uint,
    distributed-revenue: uint,
    last-distribution: uint
  }
)

;; Data structure for distributions
(define-map distributions
  { project-id: uint, distribution-id: uint }
  {
    amount: uint,
    timestamp: uint,
    completed: bool
  }
)

;; Distribution counter per project
(define-map distribution-counters
  { project-id: uint }
  { counter: uint }
)

;; Record revenue for a project
(define-public (record-revenue (project-id uint) (amount uint))
  (let
    ((revenue-data (default-to { total-revenue: u0, distributed-revenue: u0, last-distribution: u0 }
                   (map-get? project-revenue { project-id: project-id }))))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))

      (map-set project-revenue
        { project-id: project-id }
        {
          total-revenue: (+ (get total-revenue revenue-data) amount),
          distributed-revenue: (get distributed-revenue revenue-data),
          last-distribution: (get last-distribution revenue-data)
        }
      )
      (ok true)
    )
  )
)

;; Create a new distribution
(define-public (create-distribution (project-id uint) (amount uint))
  (let
    (
      (revenue-data (default-to { total-revenue: u0, distributed-revenue: u0, last-distribution: u0 }
                    (map-get? project-revenue { project-id: project-id })))
      (counter-data (default-to { counter: u0 } (map-get? distribution-counters { project-id: project-id })))
      (new-id (+ (get counter counter-data) u1))
      (available-revenue (- (get total-revenue revenue-data) (get distributed-revenue revenue-data)))
    )
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (asserts! (<= amount available-revenue) (err u400))

      ;; Update distribution counter
      (map-set distribution-counters
        { project-id: project-id }
        { counter: new-id }
      )

      ;; Create new distribution
      (map-set distributions
        { project-id: project-id, distribution-id: new-id }
        {
          amount: amount,
          timestamp: block-height,
          completed: false
        }
      )

      ;; Update project revenue
      (map-set project-revenue
        { project-id: project-id }
        {
          total-revenue: (get total-revenue revenue-data),
          distributed-revenue: (+ (get distributed-revenue revenue-data) amount),
          last-distribution: block-height
        }
      )

      (ok new-id)
    )
  )
)

;; Mark a distribution as completed
(define-public (complete-distribution (project-id uint) (distribution-id uint))
  (let
    ((distribution (unwrap! (map-get? distributions { project-id: project-id, distribution-id: distribution-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (asserts! (not (get completed distribution)) (err u400))

      ;; In a real implementation, this would distribute funds to investors based on ownership percentages

      (map-set distributions
        { project-id: project-id, distribution-id: distribution-id }
        (merge distribution { completed: true })
      )
      (ok true)
    )
  )
)

;; Get revenue details for a project
(define-read-only (get-project-revenue (project-id uint))
  (map-get? project-revenue { project-id: project-id })
)

;; Get distribution details
(define-read-only (get-distribution (project-id uint) (distribution-id uint))
  (map-get? distributions { project-id: project-id, distribution-id: distribution-id })
)

;; Get available revenue for distribution
(define-read-only (get-available-revenue (project-id uint))
  (let
    ((revenue-data (default-to { total-revenue: u0, distributed-revenue: u0, last-distribution: u0 }
                   (map-get? project-revenue { project-id: project-id }))))
    (- (get total-revenue revenue-data) (get distributed-revenue revenue-data))
  )
)

;; Initialize contract
(begin
  (var-set contract-owner tx-sender)
)
