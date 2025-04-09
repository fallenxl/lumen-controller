# Nombre de la imagen en Docker Hub
IMAGE_NAME=fallxn/lumen-controller-app
IMAGE_TAG=latest
PLATFORMS=linux/amd64,linux/arm64,linux/arm/v7

# Build multiplataforma y push
build:
	docker buildx build \
		--platform $(PLATFORMS) \
		-t $(IMAGE_NAME):$(IMAGE_TAG) \
		--push .

# Inspeccionar las plataformas disponibles
inspect:
	docker buildx imagetools inspect $(IMAGE_NAME):$(IMAGE_TAG)

# Crear builder multiplataforma (solo una vez)
create-builder:
	docker buildx create --name multi-builder --use || true
	docker buildx inspect --bootstrap
