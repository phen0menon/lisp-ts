(defun fact (n) (if (= n 0) 1 (* n (fact (- n 1)))))
(print (fact 5) " " (fact 5))
(terpri)
(print "qwe")