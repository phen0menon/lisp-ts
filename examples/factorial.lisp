(defun fact (n) (if (= n 0) 1 (* n (fact (- n 1)))))
(defun sum (a) (+ 1 (fact a)))
(print (fact 5))