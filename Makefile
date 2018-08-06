build:
	@echo "Installing dependencies..."
	npm install

	@echo "Building CSS..."


	@echo "Building files..."
	npm run build

package:
	@echo "Packaging the extension..."
	@zip -r -FS phishdetect.zip css/ dist/ img/ js/ options/ popup/ manifest.json

clean:
	rm -rf dist/
