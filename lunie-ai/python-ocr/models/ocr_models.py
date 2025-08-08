# # models/ocr_models.py
# from pydantic import BaseModel, Field
# from typing import Optional, List, Dict, Any
# from enum import Enum

# class LanguageCode(str, Enum):
#     """Supported OCR languages"""
#     ENGLISH = "eng"
#     SPANISH = "spa"
#     FRENCH = "fra"
#     GERMAN = "deu"
#     ITALIAN = "ita"
#     PORTUGUESE = "por"
#     RUSSIAN = "rus"
#     ARABIC = "ara"
#     CHINESE_SIMPLIFIED = "chi_sim"
#     CHINESE_TRADITIONAL = "chi_tra"
#     JAPANESE = "jpn"
#     KOREAN = "kor"
#     HINDI = "hin"

# class EnhancementLevel(str, Enum):
#     """Image enhancement levels"""
#     LIGHT = "light"
#     MEDIUM = "medium"
#     HEAVY = "heavy"
#     NONE = "none"

# class OCRRequest(BaseModel):
#     """OCR processing request parameters"""
#     language: LanguageCode = Field(default=LanguageCode.ENGLISH, description="OCR language")
#     enhance: bool = Field(default=True, description="Enable image enhancement")
#     enhancement_level: EnhancementLevel = Field(default=EnhancementLevel.MEDIUM, description="Enhancement level")
#     chunk_text: bool = Field(default=True, description="Split text into chunks")
#     chunk_size: int = Field(default=800, ge=100, le=2000, description="Maximum chunk size")

# class OCRResult(BaseModel):
#     """OCR processing result"""
#     success: bool = Field(description="Whether OCR processing was successful")
#     text: str = Field(default="", description="Extracted text")
#     confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="OCR confidence score")
#     word_count: int = Field(default=0, ge=0, description="Number of words extracted")
#     language: str = Field(description="Language used for OCR")
#     enhanced: bool = Field(description="Whether image was enhanced")
#     enhancement_level: str = Field(description="Enhancement level used")
#     chunks: List[str] = Field(default=[], description="Text chunks for AI processing")
#     chunk_count: int = Field(default=0, ge=0, description="Number of chunks created")
#     processing_time: float = Field(default=0.0, ge=0.0, description="Processing time in seconds")
#     metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")
#     error: Optional[str] = Field(default=None, description="Error message if processing failed")

# class HealthResponse(BaseModel):
#     """Health check response"""
#     status: str = Field(description="Service status")
#     service: str = Field(description="Service name")
#     version: str = Field(description="Service version")
#     uptime: float = Field(description="Service uptime in seconds")
#     tesseract_version: Optional[str] = Field(description="Tesseract version")