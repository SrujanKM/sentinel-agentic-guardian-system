
#!/usr/bin/env python3
"""
Setup script for initializing Azure and Gemini credentials securely
This script should be run once to set up the credentials needed by the system
"""

import os
import json
import argparse
import sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Set up credentials for the security system")
    parser.add_argument("--azure-creds", type=str, help="Path to Azure credentials JSON file")
    parser.add_argument("--gemini-key", type=str, help="Gemini API key string")
    parser.add_argument("--gemini-key-file", type=str, help="Path to file containing Gemini API key")
    parser.add_argument("--credentials-dir", type=str, default="./credentials", 
                        help="Directory to store credentials (default: ./credentials)")
    
    args = parser.parse_args()
    
    # Create credentials directory if it doesn't exist
    credentials_dir = Path(args.credentials_dir)
    credentials_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Using credentials directory: {credentials_dir.absolute()}")
    
    # Handle Azure credentials
    if args.azure_creds:
        azure_path = Path(args.azure_creds)
        if not azure_path.exists():
            print(f"Error: Azure credentials file not found at {azure_path}")
            return 1
            
        try:
            # Read and validate the JSON
            with open(azure_path, 'r') as f:
                azure_creds = json.load(f)
                
            # Check if required fields exist
            required_fields = ['client_id', 'client_secret', 'tenant_id', 'subscription_id']
            missing_fields = [field for field in required_fields if field not in azure_creds]
            
            if missing_fields:
                print(f"Warning: Azure credentials file missing required fields: {', '.join(missing_fields)}")
                response = input("Continue anyway? (y/n): ")
                if response.lower() != 'y':
                    return 1
            
            # Copy to credentials directory
            target_path = credentials_dir / 'azure_credentials.json'
            with open(target_path, 'w') as f:
                json.dump(azure_creds, f, indent=2)
                
            # Set restricted permissions (owner read/write only)
            os.chmod(target_path, 0o600)
            
            print(f"Azure credentials installed at {target_path}")
            
        except Exception as e:
            print(f"Error processing Azure credentials: {str(e)}")
            return 1
    
    # Handle Gemini API key
    gemini_key = args.gemini_key
    
    # If file is provided instead of direct key
    if args.gemini_key_file and not gemini_key:
        gemini_key_path = Path(args.gemini_key_file)
        if not gemini_key_path.exists():
            print(f"Error: Gemini API key file not found at {gemini_key_path}")
            return 1
            
        try:
            with open(gemini_key_path, 'r') as f:
                gemini_key = f.read().strip()
        except Exception as e:
            print(f"Error reading Gemini API key file: {str(e)}")
            return 1
    
    if gemini_key:
        # Validate key format (basic check)
        if not gemini_key.startswith('Gemini-') and len(gemini_key) < 20:
            print("Warning: Gemini API key doesn't match expected format")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                return 1
        
        # Save the key
        target_path = credentials_dir / 'gemini_api_key.txt'
        with open(target_path, 'w') as f:
            f.write(gemini_key)
            
        # Set restricted permissions (owner read/write only)
        os.chmod(target_path, 0o600)
        
        print(f"Gemini API key installed at {target_path}")
    
    # Final status
    if not args.azure_creds and not gemini_key:
        print("No credentials were installed. Provide at least one of --azure-creds or --gemini-key.")
        return 1
        
    print("\nCredentials setup complete.")
    print("\nIMPORTANT: The credentials files contain sensitive information.")
    print("Make sure the credentials directory has proper permissions.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
