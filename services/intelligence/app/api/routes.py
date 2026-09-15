from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/status")
def status():
    return {
        "service": "trustlens-intelligence",
        "version": "0.1.0",
        "status": "running",
        "aiFeatures": False,
    }


@router.get("/")
def root():
    return {
        "service": "trustlens-intelligence",
        "description": "TrustLens AI intelligence service",
        "version": "0.1.0",
        "endpoints": ["/health", "/status"],
    }