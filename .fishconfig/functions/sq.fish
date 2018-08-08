function sq
    squeue -S -Q -o "%.18i %.24j %.5u %.8T %.10M %.6D %R" -u $USER
end
