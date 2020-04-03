# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

export ROOT_DIR=$(pwd)
# Download pydub for retrieveMergedAudioUrl function
if [ -z "$(git --version)" ]; then
  echo "Exit... Please install git"
  exit 0
fi

echo "Download pydub for retrieveMergedAudioUrl function..."
REPOSITORY=https://github.com/jiaaro/pydub.git
git clone $REPOSITORY && cp -r $ROOT_DIR/pydub/pydub $ROOT_DIR/function/src/retrieveMergedAudioUrl

# Zip files
echo "Start zipping function..."
if [ ! -d $ROOT_DIR/function/build ]; then
  echo "Creating build folder..."
  mkdir $ROOT_DIR/function/build
elif [ "$(ls -A $ROOT_DIR/function/build)" ]; then
  echo "Remove old build files..."
  rm $ROOT_DIR/function/build/*
fi
for folder in $(ls $ROOT_DIR/function/src); do
  cd $ROOT_DIR/function/src/$folder
  if [ "$(ls -A .)" ]; then
    zip -r $ROOT_DIR/function/build/$folder.zip *
  else
    echo $ROOT_DIR/function/src/$folder "is empty"
  fi
  cd $ROOT_DIR
done

# Clean up
echo "Cleaning up " $ROOT_DIR/pydub
rm -rf $ROOT_DIR/pydub