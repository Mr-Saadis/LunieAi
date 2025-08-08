# simple_service.py - FIXED VERSION
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware  
from PIL import Image
import uvicorn
import io
import time
import os
import re
import numpy as np

# Try to import EasyOCR with better error handling
try:
    import easyocr
    EASYOCR_AVAILABLE = True
    print("✅ EasyOCR imported successfully")
    
    # Initialize readers with better error handling
    EASYOCR_READERS = {}
    try:
        print("🔄 Initializing EasyOCR English reader...")
        EASYOCR_READERS['en'] = easyocr.Reader(['en'], gpu=False)  # Use CPU first
        print("✅ EasyOCR English reader initialized successfully")
        EASYOCR_INIT_SUCCESS = True
    except Exception as e:
        print(f"❌ EasyOCR initialization failed: {e}")
        EASYOCR_INIT_SUCCESS = False
    
except ImportError as e:
    EASYOCR_AVAILABLE = False
    EASYOCR_INIT_SUCCESS = False
    print(f"⚠️ EasyOCR not available: {e}")

# Try to import OpenCV
try:
    import cv2
    CV2_AVAILABLE = True
    print("✅ OpenCV imported successfully")
except ImportError:
    CV2_AVAILABLE = False
    print("⚠️ OpenCV not available (image enhancement disabled)")

# Tesseract fallback
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
    print("✅ Tesseract imported successfully")
    
    # Configure Tesseract path for Windows
    if os.name == 'nt':  # Windows
        tesseract_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        
        for path in tesseract_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                print(f"✅ Tesseract found at: {path}")
                break
                
except ImportError:
    TESSERACT_AVAILABLE = False
    print("❌ Tesseract not available")

app = FastAPI(
    title="Fixed OCR Service",
    description="Fixed OCR service with better error handling",
    version="3.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 🔧 FIXED: Better EasyOCR Processing Function
def process_with_easyocr(image_array, language='en'):
    """Process image with EasyOCR - FIXED VERSION"""
    try:
        print(f"🎯 EasyOCR processing with language: {language}")
        
        # Ensure we have a working reader
        if language not in EASYOCR_READERS:
            print(f"🔄 Creating reader for language: {language}")
            if language == 'multi':
                EASYOCR_READERS[language] = easyocr.Reader(['en', 'es', 'fr'], gpu=False)
            else:
                EASYOCR_READERS[language] = easyocr.Reader([language], gpu=False)
        
        reader = EASYOCR_READERS[language]
        print("✅ Reader obtained, processing image...")
        
        # Ensure image is in the right format
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            # RGB format is good
            print("📷 Image format: RGB")
        elif len(image_array.shape) == 2:
            # Grayscale - convert to RGB
            print("📷 Converting grayscale to RGB")
            image_array = np.stack([image_array] * 3, axis=-1)
        
        print(f"📐 Image shape: {image_array.shape}")
        
        # Extract text with EasyOCR
        print("🔍 Running EasyOCR text extraction...")
        results = reader.readtext(
            image_array,
            paragraph=False,  # Don't group into paragraphs initially
            width_ths=0.7,   
            height_ths=0.7,  
            detail=1         
        )
        
        print(f"📄 EasyOCR found {len(results)} text regions")
        
        # Process results
        extracted_text = []
        total_confidence = 0
        valid_results = 0
        
        for (bbox, text, confidence) in results:
            print(f"   - Text: '{text}' (confidence: {confidence:.3f})")
            if confidence > 0.3:  # Lower threshold
                extracted_text.append(text)
                total_confidence += confidence
                valid_results += 1
        
        # Join text with proper spacing
        full_text = ' '.join(extracted_text)
        
        # Calculate average confidence
        avg_confidence = (total_confidence / valid_results * 100) if valid_results > 0 else 0
        
        print(f"✅ EasyOCR completed: '{full_text[:50]}...' (confidence: {avg_confidence:.1f}%)")
        
        return {
            'success': True,
            'text': full_text,
            'confidence': avg_confidence,
            'method': 'easyocr',
            'regions_found': len(results),
            'regions_used': valid_results,
            'language': language
        }
        
    except Exception as e:
        print(f"❌ EasyOCR processing failed: {str(e)}")
        print(f"   Exception type: {type(e).__name__}")
        return {
            'success': False,
            'error': f"EasyOCR failed: {str(e)}",
            'method': 'easyocr_failed'
        }

# 🔧 FIXED: Simpler image preprocessing
def preprocess_image_simple(image_array):
    """Simple image preprocessing without OpenCV dependencies"""
    try:
        # Convert to grayscale if needed
        if len(image_array.shape) == 3:
            # Simple RGB to grayscale conversion
            gray = np.dot(image_array[...,:3], [0.299, 0.587, 0.114])
            gray = gray.astype(np.uint8)
        else:
            gray = image_array.copy()
        
        return gray
        
    except Exception as e:
        print(f"Preprocessing failed: {e}")
        return image_array

# Keep your existing text post-processing function (unchanged)
def post_process_text(text, confidence=0):
    if not text or not text.strip():
        return text
    
    cleaned = text.strip()
    
    if confidence < 90:
        common_corrections = {
            r'\brn\b': 'm',
            r'\bvv\b': 'w',
            r'\b0(?=[a-zA-Z])': 'O',
            r'\b1(?=[a-zA-Z])': 'l',
            r'(?<=[a-zA-Z])0\b': 'o',
            r'(?<=[a-zA-Z])5(?=[a-zA-Z])': 's',
            r'\|': 'l',
        }
        
        for pattern, replacement in common_corrections.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
    
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'\s+([,.!?;:])', r'\1', cleaned)
    cleaned = re.sub(r'([,.!?;:])\s*', r'\1 ', cleaned)
    
    return cleaned.strip()

@app.get("/")
def read_root():
    return {
        "message": "Fixed OCR Service is running!", 
        "status": "healthy",
        "easyocr_available": EASYOCR_AVAILABLE,
        "easyocr_initialized": EASYOCR_INIT_SUCCESS,
        "tesseract_available": TESSERACT_AVAILABLE,
        "opencv_available": CV2_AVAILABLE,
        "version": "3.1.0-fixed"
    }

@app.get("/health")
def health_check():
    """Comprehensive health check"""
    
    # Test EasyOCR
    easyocr_status = "not_available"
    if EASYOCR_AVAILABLE and EASYOCR_INIT_SUCCESS:
        try:
            # Create a simple test image with text
            test_image = np.ones((100, 300, 3), dtype=np.uint8) * 255
            # Add some simple text-like pattern
            test_image[40:60, 50:250] = 0  # Black rectangle (simulated text)
            
            result = EASYOCR_READERS['en'].readtext(test_image)
            easyocr_status = f"working ({len(result)} regions detected)"
        except Exception as e:
            easyocr_status = f"error: {str(e)}"
    elif EASYOCR_AVAILABLE:
        easyocr_status = "available but initialization failed"
    
    # Test Tesseract
    tesseract_status = "not_available"
    if TESSERACT_AVAILABLE:
        try:
            test_image = Image.new('RGB', (100, 30), color='white')
            pytesseract.image_to_string(test_image)
            tesseract_status = "working"
        except Exception as e:
            tesseract_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "Fixed OCR Service",
        "easyocr_status": easyocr_status,
        "tesseract_status": tesseract_status,
        "opencv_status": "available" if CV2_AVAILABLE else "not_available",
        "version": "3.1.0-fixed",
        "port": 8002,
        "recommendations": [
            "EasyOCR works better with clear, high-contrast text",
            "Try different enhancement levels if OCR fails",
            "Use 'en' language for English text instead of 'auto'"
        ]
    }

@app.post("/ocr")
async def extract_text_from_image(
    file: UploadFile = File(...),
    language: str = Form("en"),  # Default to English instead of auto
    enhance: bool = Form(True),
    post_process: bool = Form(True),
    method: str = Form("auto")
):
    """FIXED OCR extraction with better error handling"""
    start_time = time.time()
    
    try:
        print(f"\n📸 === OCR REQUEST START ===")
        print(f"File: {file.filename} ({file.content_type})")
        print(f"Method: {method}, Language: {language}, Enhance: {enhance}")
        print(f"EasyOCR Available: {EASYOCR_AVAILABLE}, Initialized: {EASYOCR_INIT_SUCCESS}")
        print(f"Tesseract Available: {TESSERACT_AVAILABLE}")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            return {
                "success": False,
                "error": f"Invalid file type: {file.content_type}",
                "text": "",
                "confidence": 0
            }
        
        # Read image
        image_bytes = await file.read()
        print(f"📖 Read {len(image_bytes)} bytes")
        
        image = Image.open(io.BytesIO(image_bytes))
        original_size = image.size
        print(f"📐 Original image size: {original_size}")
        
        # Convert to RGB
        if image.mode != 'RGB':
            print(f"🔄 Converting from {image.mode} to RGB")
            image = image.convert('RGB')
        
        image_array = np.array(image)
        print(f"🖼️  Image array shape: {image_array.shape}")
        
        # Resize if too large (EasyOCR works better with reasonable sizes)
        max_size = 1500  # Reduced from 2000
        if max(original_size) > max_size:
            ratio = max_size / max(original_size)
            new_size = tuple(int(dim * ratio) for dim in original_size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            image_array = np.array(image)
            print(f"📏 Resized to: {new_size}")
        
        # Simple preprocessing
        processed_image = image_array
        if enhance:
            try:
                processed_image = preprocess_image_simple(image_array)
                print("✅ Image preprocessing completed")
            except Exception as e:
                print(f"⚠️  Preprocessing failed: {e}, using original")
                processed_image = image_array
        
        # Determine OCR method
        ocr_method = method
        if method == "auto":
            if EASYOCR_AVAILABLE and EASYOCR_INIT_SUCCESS:
                ocr_method = "easyocr"
            elif TESSERACT_AVAILABLE:
                ocr_method = "tesseract"
            else:
                ocr_method = "none"
        
        print(f"🔍 Using OCR method: {ocr_method}")
        
        ocr_result = None
        
        # Try EasyOCR
        if ocr_method == "easyocr" and EASYOCR_AVAILABLE and EASYOCR_INIT_SUCCESS:
            print("🎯 Attempting EasyOCR...")
            ocr_lang = 'en' if language in ['auto', 'eng'] else language
            ocr_result = process_with_easyocr(image_array, ocr_lang)  # Use original image
            
        # Fallback to Tesseract
        if (not ocr_result or not ocr_result.get('success')) and TESSERACT_AVAILABLE:
            print("🔄 Falling back to Tesseract...")
            try:
                tesseract_lang = 'eng' if language in ['auto', 'en'] else language
                custom_config = r'--oem 3 --psm 6'
                
                # Use PIL image for Tesseract
                if enhance and len(processed_image.shape) == 2:
                    pil_image = Image.fromarray(processed_image, 'L')
                else:
                    pil_image = image
                
                raw_text = pytesseract.image_to_string(pil_image, lang=tesseract_lang, config=custom_config)
                
                # Get confidence
                try:
                    data = pytesseract.image_to_data(pil_image, lang=tesseract_lang, config=custom_config, 
                                                   output_type=pytesseract.Output.DICT)
                    confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                except:
                    avg_confidence = 50
                
                ocr_result = {
                    'success': True,
                    'text': raw_text.strip(),
                    'confidence': avg_confidence,
                    'method': 'tesseract_fallback',
                    'language': tesseract_lang
                }
                print(f"✅ Tesseract completed: confidence {avg_confidence:.1f}%")
                
            except Exception as e:
                print(f"❌ Tesseract also failed: {e}")
                ocr_result = {
                    'success': False,
                    'error': f"Tesseract failed: {str(e)}",
                    'method': 'tesseract_failed'
                }
        
        # Final check
        if not ocr_result or not ocr_result.get('success'):
            error_msg = "All OCR methods failed"
            if not EASYOCR_AVAILABLE:
                error_msg += " (EasyOCR not installed)"
            elif not EASYOCR_INIT_SUCCESS:
                error_msg += " (EasyOCR initialization failed)"
            if not TESSERACT_AVAILABLE:
                error_msg += " (Tesseract not installed)"
            
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "text": "",
                "confidence": 0,
                "processing_time": round(time.time() - start_time, 3),
                "debug_info": {
                    "easyocr_available": EASYOCR_AVAILABLE,
                    "easyocr_initialized": EASYOCR_INIT_SUCCESS,
                    "tesseract_available": TESSERACT_AVAILABLE,
                    "image_size": original_size,
                    "method_attempted": ocr_method
                }
            }
        
        # Post-process text
        raw_text = ocr_result.get('text', '')
        if post_process and raw_text:
            processed_text = post_process_text(raw_text, ocr_result.get('confidence', 0))
        else:
            processed_text = raw_text.strip()
        
        # Create chunks
        chunks = []
        if processed_text:
            chunk_size = 800
            words = processed_text.split()
            current_chunk = []
            current_length = 0
            
            for word in words:
                if current_length + len(word) + 1 > chunk_size and current_chunk:
                    chunks.append(' '.join(current_chunk))
                    current_chunk = [word]
                    current_length = len(word)
                else:
                    current_chunk.append(word)
                    current_length += len(word) + 1
            
            if current_chunk:
                chunks.append(' '.join(current_chunk))
        
        processing_time = round(time.time() - start_time, 3)
        
        print(f"✅ === OCR COMPLETE ===")
        print(f"Method: {ocr_result.get('method', 'unknown')}")
        print(f"Text: '{processed_text[:50]}{'...' if len(processed_text) > 50 else ''}'")
        print(f"Confidence: {ocr_result.get('confidence', 0):.1f}%")
        print(f"Processing time: {processing_time}s")
        print(f"=========================\n")
        
        return {
            "success": True,
            "text": processed_text,
            "confidence": round(ocr_result.get('confidence', 0), 2),
            "word_count": len(processed_text.split()) if processed_text else 0,
            "language": ocr_result.get('language', language),
            "method_used": ocr_result.get('method', 'unknown'),
            "enhanced": enhance,
            "post_processed": post_process,
            "chunks": chunks,
            "chunk_count": len(chunks),
            "processing_time": processing_time,
            "metadata": {
                "original_filename": file.filename,
                "file_size": len(image_bytes),
                "image_dimensions": original_size,
                "raw_text_length": len(raw_text),
                "processed_text_length": len(processed_text),
                "regions_found": ocr_result.get('regions_found', 0),
                "regions_used": ocr_result.get('regions_used', 0)
            }
        }
        
    except Exception as e:
        processing_time = round(time.time() - start_time, 3)
        print(f"❌ FATAL OCR Error: {str(e)}")
        
        return {
            "success": False,
            "error": f"OCR processing failed: {str(e)}",
            "text": "",
            "confidence": 0,
            "processing_time": processing_time
        }

if __name__ == "__main__":
    print("🚀 Starting FIXED OCR Service...")
    print("📖 API Documentation: http://localhost:8002/docs")
    print("🏥 Health Check: http://localhost:8002/health")
    print("🔍 OCR Endpoint: http://localhost:8002/ocr")
    
    print("\n🔧 Service Status:")
    print(f"   EasyOCR Available: {EASYOCR_AVAILABLE}")
    print(f"   EasyOCR Initialized: {EASYOCR_INIT_SUCCESS}")
    print(f"   Tesseract Available: {TESSERACT_AVAILABLE}")
    print(f"   OpenCV Available: {CV2_AVAILABLE}")
    
    if not EASYOCR_AVAILABLE:
        print("\n⚠️  To install EasyOCR: pip install easyocr")
    if not TESSERACT_AVAILABLE:
        print("\n⚠️  To install Tesseract: pip install pytesseract")
        
    print("\n" + "="*50)
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=8002, reload=False)
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        input("Press Enter to exit...")