set -x SU2_RUN /home/sguenther/Numerics/SU2/bin
set -x ICECREAM_PATH /usr/libexec/icecc/bin
set -x OPENMPI_PATH  /usr/lib64/openmpi/bin
set -x OPENMPI_LD_PATH /usr/lib64/openmpi/lib

set -x PATH $SU2_RUN $ICECREAM_PATH $OPENMPI_PATH $PATH
set -x LD_LIBRARY_PATH $OPENMPI_LD_PATH $LD_LIBRARY_PATH

set -x ICECC_VERSION /home/sguenther/Software/gcc7.3.1.tar.gz
set -x ICECC_CARET_WORKAROUND 0
