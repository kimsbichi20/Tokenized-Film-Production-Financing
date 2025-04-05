;; Production Milestone Contract
;; Monitors progress against project plan

(define-data-var contract-owner principal tx-sender)

;; Data structure for milestones
(define-map milestones
  { project-id: uint, milestone-id: uint }
  {
    description: (string-utf8 100),
    funds-allocated: uint,
    completed: bool,
    funds-released: bool,
    completion-date: uint
  }
)

;; Milestone counter per project
(define-map milestone-counters
  { project-id: uint }
  { counter: uint }
)

;; Add a milestone to a project
(define-public (add-milestone (project-id uint) (description (string-utf8 100)) (funds-allocated uint))
  (let
    (
      (counter-data (default-to { counter: u0 } (map-get? milestone-counters { project-id: project-id })))
      (new-id (+ (get counter counter-data) u1))
    )
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))

      ;; Update milestone counter
      (map-set milestone-counters
        { project-id: project-id }
        { counter: new-id }
      )

      ;; Add new milestone
      (map-set milestones
        { project-id: project-id, milestone-id: new-id }
        {
          description: description,
          funds-allocated: funds-allocated,
          completed: false,
          funds-released: false,
          completion-date: u0
        }
      )
      (ok new-id)
    )
  )
)

;; Mark a milestone as completed
(define-public (complete-milestone (project-id uint) (milestone-id uint))
  (let
    ((milestone (unwrap! (map-get? milestones { project-id: project-id, milestone-id: milestone-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (asserts! (not (get completed milestone)) (err u400))

      (map-set milestones
        { project-id: project-id, milestone-id: milestone-id }
        (merge milestone {
          completed: true,
          completion-date: block-height
        })
      )
      (ok true)
    )
  )
)

;; Release funds for a completed milestone
(define-public (release-milestone-funds (project-id uint) (milestone-id uint))
  (let
    ((milestone (unwrap! (map-get? milestones { project-id: project-id, milestone-id: milestone-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (asserts! (get completed milestone) (err u400))
      (asserts! (not (get funds-released milestone)) (err u400))

      ;; In a real implementation, this would transfer funds to the production company

      (map-set milestones
        { project-id: project-id, milestone-id: milestone-id }
        (merge milestone { funds-released: true })
      )
      (ok (get funds-allocated milestone))
    )
  )
)

;; Get milestone details
(define-read-only (get-milestone (project-id uint) (milestone-id uint))
  (map-get? milestones { project-id: project-id, milestone-id: milestone-id })
)

;; Get milestone count for a project
(define-read-only (get-milestone-count (project-id uint))
  (get counter (default-to { counter: u0 } (map-get? milestone-counters { project-id: project-id })))
)

;; Initialize contract
(begin
  (var-set contract-owner tx-sender)
)
