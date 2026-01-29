import fastf1
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

# Create cache directory
if not os.path.exists('cache'):
    os.makedirs('cache')

# Enable FastF1 Cache
fastf1.Cache.enable_cache('cache')

app = FastAPI(title="F1 Tech Hub API", description="API for F1 Data using FastF1")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In prod, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the F1 Tech Hub API. Use /api/ endpoints to fetch data."}

@app.get("/api/season/{year}/drivers")
def get_drivers(year: int):
    try:
        # Load a session specifically to get drivers? 
        # Easier: Get the schedule, pick the last race, get drivers from there?
        # Or usually just specific driver info.
        # FastF1 doesn't have a simple "get all drivers for season" API without loading a session.
        # We'll load the first race of the season to get the driver list.
        session = fastf1.get_session(year, 1, 'R')
        session.load(telemetry=False, laps=False, weather=False)
        drivers = session.results
        # Extract relevant fields
        driver_list = []
        for d in drivers.index: # drivers.index is driver number usually? No, session.results is indexed by driver number if configured, but let's check columns.
             # Actually session.results is a DataFrame indexed by DriverNumber usually after load.
             row = drivers.loc[d]
             driver_list.append({
                 "driver_number": row['DriverNumber'],
                 "broadcast_name": row['BroadcastName'],
                 "full_name": row['FullName'],
                 "abbreviation": row['Abbreviation'],
                 "team_name": row['TeamName'],
                 "position": clean_numpy(row['Position']),
                 "points": row['Points'],
                 "grid_position": clean_numpy(row['GridPosition'])
             })
        return driver_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/season/{year}/constructors")
def get_constructors(year: int):
    # Similar logic, just grouping by TeamName
    try:
        session = fastf1.get_session(year, 1, 'R')
        session.load(telemetry=False, laps=False, weather=False)
        teams = session.results['TeamName'].unique()
        return list(teams)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/race/{year}/{round}/results")
def get_race_results(year: int, round: int):
    try:
        session = fastf1.get_session(year, round, 'R')
        session.load(telemetry=False, weather=False) # Load minimal
        results = session.results
        
        data = []
        for d in results.index:
            row = results.loc[d]
            data.append({
                "driver": row['Abbreviation'],
                "team": row['TeamName'],
                "position": clean_numpy(row['Position']),
                "time": str(row['Time']),
                "status": row['Status'],
                "points": row['Points']
            })
        return {"race": session.event['EventName'], "results": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/race/{year}/{round}/tyres")
def get_tyre_data(year: int, round: int):
    try:
        session = fastf1.get_session(year, round, 'R')
        session.load(telemetry=False, weather=False) 
        laps = session.laps
        
        # We want tyre choices and stint lengths
        # Group by Driver and Stint
        stints = []
        
        drivers = session.results['Abbreviation'].unique()
        
        for driver in drivers:
            d_laps = laps.pick_driver(driver)
            # Group by stint
            for stint_id in d_laps['Stint'].unique():
                stint_laps = d_laps[d_laps['Stint'] == stint_id]
                if stint_laps.empty:
                    continue
                
                compound = stint_laps['Compound'].iloc[0]
                laps_count = len(stint_laps)
                
                # Safe mean calculation
                mean_val = stint_laps['LapTime'].mean()
                if pd.isna(mean_val):
                    mean_lap_time = 0
                else:
                    mean_lap_time = mean_val.total_seconds()
                
                stints.append({
                    "driver": driver,
                    "stint": int(stint_id) if not pd.isna(stint_id) else 0,
                    "compound": str(compound),
                    "laps_count": int(laps_count),
                    "mean_lap_time": float(mean_lap_time)
                })
        
        return stints
    except Exception as e:
        print(f"Error in tyre data: {e}") # Debug log
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Tyre Data Error: {str(e)}")

@app.get("/api/season/{year}/races")
def get_races(year: int):
    try:
        schedule = fastf1.get_event_schedule(year)
        # Filter for completed or valid races
        # We'll just return all conventional races
        if 'EventFormat' in schedule.columns:
            races = schedule[schedule['EventFormat'] == 'conventional']
        else:
            races = schedule
            
        data = []
        for i, row in races.iterrows():
            data.append({
                "round": int(row['RoundNumber']),
                "name": row['EventName'],
                "location": row['Location'],
                "date": str(row['EventDate'])
            })
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/specs")
def get_car_specs():
    # Hardcoded technical specs for 2024 Gen cars
    return {
        "engine": {
            "type": "1.6L V6 Turbo Hybrid",
            "valves": "24 (4 per cylinder)",
            "rpm_limit": "15,000 RPM",
            "fuel_flow": "100 kg/hour max"
        },
        "power": {
            "total_output": "> 1,000 BHP",
            "ice_output": "~850 BHP",
            "mguk_output": "161 BHP (120 kW)",
            "0_100_kmh": "~2.6 seconds"
        },
        "battery": {
            "type": "Lithium-Ion",
            "weight": "Min 20 kg",
            "usable_energy": "4 MJ per lap",
            "voltage": "~400-900V System"
        },
        "dimensions": {
            "weight": "798 kg (Minimum)",
            "width": "2000 mm",
            "tires": "18-inch Pirelli"
        }
    }

# Hardcoded Career Stats for Top Drivers (2024 End)
CAREER_STATS = {
    "VER": {"wins": 63, "wdc": 4, "podiums": 113},
    "HAM": {"wins": 105, "wdc": 7, "podiums": 201},
    "ALO": {"wins": 32, "wdc": 2, "podiums": 106},
    "SAI": {"wins": 4, "wdc": 0, "podiums": 25},
    "LEC": {"wins": 8, "wdc": 0, "podiums": 41},
    "NOR": {"wins": 3, "wdc": 0, "podiums": 24}, # Updated 2024
    "RUS": {"wins": 2, "wdc": 0, "podiums": 14},
    "PIA": {"wins": 2, "wdc": 0, "podiums": 9},
    "PER": {"wins": 6, "wdc": 0, "podiums": 39},
    "BOT": {"wins": 10, "wdc": 0, "podiums": 67},
}

@app.get("/api/driver/{abbreviation}/career")
def get_driver_career(abbreviation: str):
    return CAREER_STATS.get(abbreviation, {"wins": 0, "wdc": 0, "podiums": 0})

def clean_numpy(val):
    # Helper to clean numpy types for JSON serialization
    if pd.isna(val):
        return None
    try:
        return float(val)
    except:
        return str(val)

@app.get("/api/season/{year}/team-stats")
def get_team_stats(year: int):
    try:
        # Get schedule for the year
        schedule = fastf1.get_event_schedule(year)
        # Check if 'EventFormat' exists
        if 'EventFormat' not in schedule.columns:
             # Fallback for older/newer versions if column missing
             # Just assume conventional if missing or use logic
             ids = schedule['RoundNumber']
        else:
             completed_races = schedule[schedule['EventFormat'] == 'conventional'] 
             ids = completed_races['RoundNumber']
        
        stats = {}
        count = 0
        
        for r_num in ids:
            try:
                # Basic check if race happened (approximate)
                # We can just try to load it.
                session = fastf1.get_session(year, r_num, 'R')
                # Optimisation: Load minimal data
                session.load(telemetry=False, laps=False, weather=False, messages=False)
                results = session.results
                
                if results.empty: continue

                # Wins & Poles
                winner = results.loc[results['Position'] == 1]
                pole = results.loc[results['GridPosition'] == 1]
                
                if not winner.empty:
                    team = winner.iloc[0]['TeamName']
                    if team not in stats: stats[team] = {'wins': 0, 'poles': 0, 'starts': 0, 'drivers': set()}
                    stats[team]['wins'] += 1
                    
                if not pole.empty:
                    team = pole.iloc[0]['TeamName']
                    if team not in stats: stats[team] = {'wins': 0, 'poles': 0, 'starts': 0, 'drivers': set()}
                    stats[team]['poles'] += 1
                
                # Count starts and drivers
                for _, row in results.iterrows():
                    t = row['TeamName']
                    if t not in stats: stats[t] = {'wins': 0, 'poles': 0, 'starts': 0, 'drivers': set()}
                    stats[t]['starts'] += 1
                    stats[t]['drivers'].add(row['Abbreviation'])
                    
                count += 1
                if count >= 5: break # LIMIT to 5 races for performance
            except Exception as e:
                print(f"Skipping race {r_num}: {e}")
                continue
                
        # Format for API
        final_data = []
        for team, data in stats.items():
            final_data.append({
                "team": team,
                "wins": data['wins'],
                "poles": data['poles'],
                "starts": data['starts'],
                "drivers": list(data['drivers'])
            })
            
        return final_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
