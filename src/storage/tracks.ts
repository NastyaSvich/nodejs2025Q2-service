import { Track } from '../track/entities/track.entity';

export class Tracks {
  private tracks: Track[] = [];

  findAll(): Track[] {
    return [...this.tracks];
  }

  findById(id: string): Track | undefined {
    return this.tracks.find((track) => track.id === id);
  }

  create(track: Track): Track {
    this.tracks.push(track);
    return track;
  }

  update(track: Track): Track {
    const index = this.tracks.findIndex((tr) => tr.id === track.id);
    this.tracks[index] = track;
    return track;
  }

  delete(id: string): void {
    this.tracks = this.tracks.filter((track) => track.id !== id);
  }
}
