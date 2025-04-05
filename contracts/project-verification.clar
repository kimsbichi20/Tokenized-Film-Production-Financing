;; Project Verification Contract
;; Validates legitimate film productions

(define-data-var contract-owner principal tx-sender)

;; Data structure for film projects
(define-map film-projects
  { project-id: uint }
  {
    title: (string-utf8 100),
    director: (string-utf8 100),
    budget: uint,
    start-date: uint,
    end-date: uint,
    verified: bool,
    active: bool
  }
)

;; Counter for project IDs
(define-data-var project-id-counter uint u0)

;; Register a new film project
(define-public (register-project (title (string-utf8 100)) (director (string-utf8 100)) (budget uint) (start-date uint) (end-date uint))
  (let
    ((new-id (+ (var-get project-id-counter) u1)))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (var-set project-id-counter new-id)
      (map-set film-projects
        { project-id: new-id }
        {
          title: title,
          director: director,
          budget: budget,
          start-date: start-date,
          end-date: end-date,
          verified: false,
          active: true
        }
      )
      (ok new-id)
    )
  )
)

;; Verify a film project
(define-public (verify-project (project-id uint))
  (let
    ((project (unwrap! (map-get? film-projects { project-id: project-id }) (err u404))))
    (begin
      (asserts! (is-eq tx-sender (var-get contract-owner)) (err u403))
      (map-set film-projects
        { project-id: project-id }
        (merge project { verified: true })
      )
      (ok true)
    )
  )
)

;; Get project details
(define-read-only (get-project (project-id uint))
  (map-get? film-projects { project-id: project-id })
)

;; Check if a project is verified
(define-read-only (is-project-verified (project-id uint))
  (default-to false (get verified (map-get? film-projects { project-id: project-id })))
)

;; Initialize contract
(begin
  (var-set contract-owner tx-sender)
)
